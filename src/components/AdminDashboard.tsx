
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Users, Coffee } from 'lucide-react';
import { Question } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  has_donated?: boolean;
}

interface AdminDashboardProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  onBack: () => void;
}

const AdminDashboard = ({ questions, setQuestions, onBack }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    answer: true,
    explanation: '',
    category: '',
    image_url: ''
  });

  const categories = Array.from(new Set(questions.map(q => q.category)));

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For now, we'll mock the donation status since we don't have a donations table
      // In a real app, you'd join with a donations table or track this separately
      const usersWithDonationStatus = data?.map(user => ({
        ...user,
        has_donated: Math.random() > 0.7 // Mock donation status for demo
      })) || [];

      setUsers(usersWithDonationStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      answer: true,
      explanation: '',
      category: '',
      image_url: ''
    });
    setShowAddForm(false);
    setEditingQuestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question_text.trim() || !formData.explanation.trim() || !formData.category.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingQuestion) {
      // Update existing question
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, ...formData }
          : q
      );
      setQuestions(updatedQuestions);
    } else {
      // Add new question
      const newQuestion: Question = {
        id: Math.max(...questions.map(q => q.id), 0) + 1,
        ...formData
      };
      setQuestions([...questions, newQuestion]);
    }
    
    resetForm();
  };

  const handleEdit = (question: Question) => {
    setFormData({
      question_text: question.question_text,
      answer: question.answer,
      explanation: question.explanation,
      category: question.category,
      image_url: question.image_url || ''
    });
    setEditingQuestion(question);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const filteredQuestions = filterCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === filterCategory);

  const donatedUsers = users.filter(u => u.has_donated).length;
  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{questions.length}</div>
              <div className="text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{categories.length}</div>
              <div className="text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalUsers}</div>
              <div className="text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{donatedUsers}</div>
              <div className="text-gray-600">Coffee Supporters</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Questions Management</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users Management</span>
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
            {/* Add Question Button */}
            <div className="flex justify-end mb-6">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetForm}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="question">Question Text *</Label>
                        <Textarea
                          id="question"
                          value={formData.question_text}
                          onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                          placeholder="Enter the question text..."
                          className="mt-2"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="answer">Correct Answer *</Label>
                        <Select 
                          value={formData.answer.toString()} 
                          onValueChange={(value) => setFormData({...formData, answer: value === 'true'})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="e.g., Traffic Signs, Road Rules"
                          className="mt-2"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="image_url">Image URL (Optional)</Label>
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="explanation">Explanation *</Label>
                        <Textarea
                          id="explanation"
                          value={formData.explanation}
                          onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                          placeholder="Explain why this answer is correct..."
                          className="mt-2"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {editingQuestion ? 'Update Question' : 'Add Question'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Questions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Questions Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="filter">Filter by Category:</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={question.question_text}>
                              {question.question_text}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 truncate" title={question.explanation}>
                              {question.explanation}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={question.answer ? "default" : "destructive"}>
                              {question.answer ? 'True' : 'False'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {question.image_url ? (
                              <Badge variant="secondary">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(question)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(question.id)}
                                className="hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredQuestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No questions found.</p>
                    <p>Add your first question to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Users Management</span>
                  </CardTitle>
                  <Button 
                    onClick={fetchUsers} 
                    variant="outline"
                    disabled={loadingUsers}
                  >
                    {loadingUsers ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Coffee Support</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">
                                {user.full_name || 'No name'}
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Coffee className="w-4 h-4" />
                                <Badge variant={user.has_donated ? 'default' : 'outline'}>
                                  {user.has_donated ? 'Supporter' : 'Not yet'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {!loadingUsers && users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No users found.</p>
                    <p>Users will appear here once they sign up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
