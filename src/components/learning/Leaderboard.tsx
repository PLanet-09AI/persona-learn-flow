import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, BookOpen, TrendingUp } from "lucide-react";
import { UserProfile } from "./LearningDashboard";
import { getLeaderboardWithUserVisible, getUserAchievements } from "@/services/leaderboard";

interface LeaderboardProps {
  userProfile: UserProfile;
  onNewLesson: () => void;
}

export const Leaderboard = ({ userProfile, onNewLesson }: LeaderboardProps) => {
  const [leaderboardData, setLeaderboardData] = useState(getLeaderboardWithUserVisible(userProfile));
  const [achievements, setAchievements] = useState(getUserAchievements(userProfile));

  // Update leaderboard when userProfile changes
  useEffect(() => {
    setLeaderboardData(getLeaderboardWithUserVisible(userProfile));
    setAchievements(getUserAchievements(userProfile));
  }, [userProfile]);

  const currentUser = leaderboardData.find(user => user.isCurrentUser);
  const userRank = currentUser?.rank || 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="h-6 w-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</div>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 10) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Leaderboard
        </h2>
        <p className="text-muted-foreground">See how you rank against other learners</p>
      </div>

      {/* User Stats Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">#{userRank}</div>
              <div className="text-sm text-muted-foreground">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userProfile.score}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{userProfile.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">1</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Global Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                user.isCurrentUser 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted/50"
              } ${
                // If this is not a top entry and not the user's entry, add a separator
                index > 0 && index === leaderboardData.length - 3 && !user.isCurrentUser
                  ? "mt-3 border-t pt-3"
                  : ""
              }`}
            >
              {/* Rank Icon */}
              <div className="flex-shrink-0">
                {getRankIcon(user.rank!)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className={user.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${user.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                    {user.name}
                  </span>
                  {user.isCurrentUser && <Badge variant="default">You</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.field || "Unknown"}</span>
                  <span>•</span>
                  <span>Level {user.level}</span>
                  <span>•</span>
                  <span>{user.streak} day streak</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-foreground">{user.score.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">points</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {achievements.map(achievement => {
              // Determine which icon to use
              let IconComponent;
              switch (achievement.icon) {
                case "BookOpen":
                  IconComponent = BookOpen;
                  break;
                case "Star":
                  IconComponent = Star;
                  break;
                case "TrendingUp":
                  IconComponent = TrendingUp;
                  break;
                default:
                  IconComponent = Award;
              }
              
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.isUnlocked 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-muted/50 border-muted opacity-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    achievement.isUnlocked ? 'bg-success/20' : 'bg-muted'
                  }`}>
                    <IconComponent 
                      className={`h-4 w-4 ${
                        achievement.isUnlocked ? 'text-success' : 'text-muted-foreground'
                      }`} 
                    />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      achievement.isUnlocked ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onNewLesson} className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Continue Learning
        </Button>
        <Button variant="outline">
          <Trophy className="h-4 w-4 mr-2" />
          View All Achievements
        </Button>
      </div>
    </div>
  );
};