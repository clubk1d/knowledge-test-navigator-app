
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Question } from '@/types/quiz';

interface AdminDashboardProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  onBack: () => void;
}

const AdminDashboard = ({ questions, setQuestions, onBack }: AdminDashboardProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    answer: true,
    explanation: '',
    category: '',
    image_url: ''
  });

  const categories = Array.from(new Set(questions.map(q => q.category)));

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
          
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {questions.filter(q => q.image_url).length}
              </div>
              <div className="text-gray-600">With Images</div>
            </CardContent>
          </Card>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
