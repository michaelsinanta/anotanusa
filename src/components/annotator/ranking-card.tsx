"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trophy, Medal, Award } from "lucide-react";

interface RankingCardProps {
  id: number;
  label: string;
  rank?: number;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, id: number) => void;
  onDragEnd?: () => void;
}

export default function RankingCard({
  id,
  label,
  rank,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: RankingCardProps) {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="flex h-5 w-5 items-center justify-center text-sm font-bold text-gray-500">
            {rank}
          </div>
        );
    }
  };

  const getRankColor = () => {
    switch (rank) {
      case 1:
        return "border-yellow-300 bg-yellow-50";
      case 2:
        return "border-gray-300 bg-gray-50";
      case 3:
        return "border-amber-300 bg-amber-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart?.(e, id)}
      onDragEnd={onDragEnd}
      className={`cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? "scale-105 rotate-2 opacity-50" : ""
      } ${rank ? getRankColor() : "border-gray-200 bg-white"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="mt-1 flex-shrink-0">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          {/* Rank Indicator */}
          {rank && <div className="mt-0.5 flex-shrink-0">{getRankIcon()}</div>}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between">
              <p className="text-sm leading-relaxed font-medium text-gray-900">
                {label}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
