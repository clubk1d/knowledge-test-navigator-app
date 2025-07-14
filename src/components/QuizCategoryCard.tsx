
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Share2, BookOpen, Trophy } from 'lucide-react';

interface QuizCategoryCardProps {
  category: 'Karimen' | 'HonMen';
  hasSharedSocial: boolean;
  onStartQuiz: (category: 'Karimen' | 'HonMen') => void;
  onShowSocialModal: () => void;
}

const QuizCategoryCard = ({ category, hasSharedSocial, onStartQuiz, onShowSocialModal }: QuizCategoryCardProps) => {
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
        
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
          <p className="text-sm text-green-800 text-center">
            First 50 questions are free! Remaining 100 questions
            {hasSharedSocial ? (
              <span className="font-semibold text-green-600"> unlocked ✓</span>
            ) : (
              <span className="font-semibold text-blue-600"> unlock by sharing</span>
            )}
          </p>
        </div>
        
        <Button 
          onClick={() => onStartQuiz(category)}
          className={`w-full ${buttonClass} text-sm sm:text-base lg:text-lg py-4 sm:py-5 lg:py-6`}
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="truncate">Start {category} Quiz ({hasSharedSocial ? '150' : '50'} questions)</span>
        </Button>
        
        {!hasSharedSocial && (
          <Button 
            onClick={onShowSocialModal}
            variant="outline"
            className={`w-full ${outlineClass} py-3 sm:py-4 text-sm sm:text-base`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="truncate">Share to Unlock All Questions</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizCategoryCard;
