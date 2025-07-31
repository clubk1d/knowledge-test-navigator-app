
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Save, X, ArrowLeft, LogOut } from 'lucide-react';
import { Question } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  onBack: () => void;
  onLogout: () => void;
}

const AdminDashboard = ({ questions, setQuestions, onBack, onLogout }: AdminDashboardProps) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Karimen' | 'HonMen'>('all');
  const { toast } = useToast();

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question_text: '',
    answer: true,
    explanation: '',
    category: 'Karimen',
    image_url: '',
    is_premium: false
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveQuestion = () => {
    if (!newQuestion.question_text || !newQuestion.explanation) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const questionToSave: Question = {
      id: Date.now(),
      question_text: newQuestion.question_text || '',
      answer: newQuestion.answer || false,
      explanation: newQuestion.explanation || '',
      category: newQuestion.category as 'Karimen' | 'HonMen' || 'Karimen',
      image_url: newQuestion.image_url || '',
      is_premium: newQuestion.is_premium || false
    };

    if (editingQuestion) {
      // Update existing question
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? { ...questionToSave, id: editingQuestion.id } : q
      );
      setQuestions(updatedQuestions);
      setEditingQuestion(null);
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } else {
      // Create new question
      setQuestions([...questions, questionToSave]);
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Question created successfully",
      });
    }

    // Reset form
    setNewQuestion({
      question_text: '',
      answer: true,
      explanation: '',
      category: 'Karimen',
      image_url: '',
      is_premium: false
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question_text: question.question_text,
      answer: question.answer,
      explanation: question.explanation,
      category: question.category,
      image_url: question.image_url || '',
      is_premium: question.is_premium || false
    });
    setIsCreating(true);
  };

  const handleDeleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    setQuestions(updatedQuestions);
    toast({
      title: "Success",
      description: "Question deleted successfully",
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingQuestion(null);
    setNewQuestion({
      question_text: '',
      answer: true,
      explanation: '',
      category: 'Karimen',
      image_url: '',
      is_premium: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quiz
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <Button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
            <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:border-red-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
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
              <div className="text-3xl font-bold text-green-600 mb-2">
                {questions.filter(q => q.category === 'Karimen').length}
              </div>
              <div className="text-gray-600">Provisional License</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {questions.filter(q => q.category === 'HonMen').length}
              </div>
              <div className="text-gray-600">Full License</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {questions.filter(q => q.is_premium).length}
              </div>
              <div className="text-gray-600">Premium Questions</div>
            </CardContent>
          </Card>
        </div>

        {/* Question Creation/Edit Form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question-text">Question Text *</Label>
                <Textarea
                  id="question-text"
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                  placeholder="Enter the question text"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value: 'Karimen' | 'HonMen') => 
                      setNewQuestion({...newQuestion, category: value})
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Karimen">Provisional License (Karimen)</SelectItem>
                      <SelectItem value="HonMen">Full License (HonMen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="answer"
                      checked={newQuestion.answer}
                      onCheckedChange={(checked) => setNewQuestion({...newQuestion, answer: checked})}
                    />
                    <Label htmlFor="answer">
                      Answer: {newQuestion.answer ? 'TRUE' : 'FALSE'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="premium"
                      checked={newQuestion.is_premium}
                      onCheckedChange={(checked) => setNewQuestion({...newQuestion, is_premium: checked})}
                    />
                    <Label htmlFor="premium">Premium Question</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation *</Label>
                <Textarea
                  id="explanation"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  placeholder="Enter the explanation for the answer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image-url">Image URL (optional)</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={newQuestion.image_url}
                  onChange={(e) => setNewQuestion({...newQuestion, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSaveQuestion} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search Questions</Label>
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by question text..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="filter-category">Filter by Category</Label>
                <Select
                  value={filterCategory}
                  onValueChange={(value: 'all' | 'Karimen' | 'HonMen') => setFilterCategory(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Karimen">Provisional License (Karimen)</SelectItem>
                    <SelectItem value="HonMen">Full License (HonMen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={question.category === 'Karimen' ? 'default' : 'secondary'}>
                        {question.category === 'Karimen' ? 'Provisional License' : 'Full License'}
                      </Badge>
                      <Badge variant={question.answer ? 'default' : 'destructive'}>
                        {question.answer ? 'TRUE' : 'FALSE'}
                      </Badge>
                      {question.is_premium && (
                        <Badge variant="outline">Premium</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{question.question_text}</h3>
                    <p className="text-gray-600 mb-4">{question.explanation}</p>

                    {question.image_url && (
                      <div className="mb-4">
                        <img 
                          src={question.image_url} 
                          alt="Question illustration"
                          className="max-w-xs h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No questions found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
