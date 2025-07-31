
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const QuizStats = () => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm mb-8">
      <CardContent className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">150</div>
            <div className="text-gray-600">Provisional License Questions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">150</div>
            <div className="text-gray-600">Full License Questions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">300</div>
            <div className="text-gray-600">Available Questions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
            <div className="text-gray-600">Practice Attempts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizStats;
