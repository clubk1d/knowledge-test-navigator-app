import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SetSelectorProps {
  category: 'Karimen' | 'HonMen';
  totalQuestions: number;
  onSelectSet: (setNumber: number) => void;
  onBack: () => void;
}

const SetSelector = ({ category, totalQuestions, onSelectSet, onBack }: SetSelectorProps) => {
  const questionsPerSet = category === 'Karimen' ? 50 : 100;
  const totalSets = Math.ceil(totalQuestions / questionsPerSet);
  
  const sets = Array.from({ length: totalSets }, (_, index) => {
    const setNumber = index + 1;
    const startQuestion = index * questionsPerSet + 1;
    const endQuestion = Math.min((index + 1) * questionsPerSet, totalQuestions);
    
    return {
      number: setNumber,
      title: `Set ${setNumber}`,
      description: `Questions ${startQuestion}-${endQuestion}`,
      questionCount: endQuestion - startQuestion + 1
    };
  });

  const isKarimen = category === 'Karimen';
  const colorClass = isKarimen ? 'blue' : 'green';
  const titleColor = isKarimen ? 'text-blue-700' : 'text-green-700';
  const buttonClass = isKarimen 
    ? 'bg-blue-600 hover:bg-blue-700' 
    : 'bg-green-600 hover:bg-green-700';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className={`text-xl ${titleColor}`}>
            Select {category} Test Set
          </CardTitle>
        </div>
        <p className="text-gray-600 text-sm">
          Choose a set of {questionsPerSet} questions to practice
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sets.map((set) => (
            <Button
              key={set.number}
              onClick={() => onSelectSet(set.number)}
              variant="outline"
              className={`h-auto py-4 px-6 text-left justify-start ${
                isKarimen 
                  ? 'border-blue-200 hover:bg-blue-50 hover:border-blue-300' 
                  : 'border-green-200 hover:bg-green-50 hover:border-green-300'
              }`}
            >
              <div>
                <div className={`font-semibold ${titleColor}`}>
                  {set.title}
                </div>
                <div className="text-sm text-gray-600">
                  {set.description}
                </div>
                <div className="text-xs text-gray-500">
                  {set.questionCount} questions
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SetSelector;