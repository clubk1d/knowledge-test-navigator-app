
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy } from 'lucide-react';

interface QuizCategoryCardProps {
  category: 'Karimen' | 'HonMen';
  onStartChallenge: (category: 'Karimen' | 'HonMen', challenge: 'timed' | 'untimed' | 'regulations' | 'signs' | 'normal', setNumber?: number) => void;
}

const QuizCategoryCard = ({ category, onStartChallenge }: QuizCategoryCardProps) => {
  const isKarimen = category === 'Karimen';
  const title = isKarimen ? 'Provisional License (Karimen)' : 'Full License (HonMen)';
  const description = isKarimen 
    ? 'Practice test for obtaining your provisional driving license'
    : 'Practice test for obtaining your full driving license';
  const icon = isKarimen ? BookOpen : Trophy;
  const colorClass = isKarimen ? 'blue' : 'green';
  const hoverClass = isKarimen ? 'hover:border-blue-200' : 'hover:border-green-200';
  const titleColor = isKarimen ? 'text-blue-700' : 'text-green-700';
  const buttonClass = isKarimen 
    ? 'bg-blue-600 hover:bg-blue-700' 
    : 'bg-green-600 hover:bg-green-700';
  const outlineClass = isKarimen
    ? 'border-blue-300 text-blue-700 hover:bg-blue-50'
    : 'border-green-300 text-green-700 hover:bg-green-50';

  const IconComponent = icon;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-2 ${hoverClass}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className={`text-2xl ${titleColor} flex items-center justify-center`}>
          <IconComponent className="w-6 h-6 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-center mb-6">
          {description}
        </p>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <p className="text-sm text-blue-800 text-center font-semibold">
            Choose your challenge type below
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => onStartChallenge(category, 'normal')}
            className={`${buttonClass} text-sm py-3 w-full`}
          >
            📚 Normal Test (Sets)
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => onStartChallenge(category, 'timed')}
              variant="outline"
              className={`${outlineClass} text-xs sm:text-sm py-3`}
            >
              ⏱️ Timed
            </Button>
            
            <Button 
              onClick={() => onStartChallenge(category, 'untimed')}
              variant="outline"
              className={`${outlineClass} text-xs sm:text-sm py-3`}
            >
              🎯 Untimed
            </Button>
            
            <Button 
              onClick={() => onStartChallenge(category, 'regulations')}
              variant="outline"
              className={`${outlineClass} text-xs sm:text-sm py-3`}
            >
              📋 Regulations
            </Button>
            
            <Button 
              onClick={() => onStartChallenge(category, 'signs')}
              variant="outline"
              className={`${outlineClass} text-xs sm:text-sm py-3`}
            >
              🚧 Signs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCategoryCard;
