import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, BookOpen, TrendingUp } from "lucide-react";
import { UserProfile } from "./LearningDashboard";

// Mock leaderboard data
const mockLeaderboardData = [
  { rank: 1, name: "Alex Chen", score: 2450, level: 25, field: "Web Development", streak: 12 },
  { rank: 2, name: "Sarah Johnson", score: 2380, level: 24, field: "Data Science", streak: 8 },
  { rank: 3, name: "Mike Rodriguez", score: 2250, level: 23, field: "Digital Marketing", streak: 15 },
  { rank: 4, name: "Emma Wilson", score: 2100, level: 21, field: "Graphic Design", streak: 6 },
  { rank: 5, name: "You", score: 0, level: 1, field: "", streak: 1 }, // User placeholder
  { rank: 6, name: "David Kim", score: 1980, level: 20, field: "Business Strategy", streak: 9 },
  { rank: 7, name: "Lisa Zhang", score: 1850, level: 19, field: "Machine Learning", streak: 4 },
  { rank: 8, name: "James Miller", score: 1720, level: 18, field: "Web Development", streak: 7 },
];

interface LeaderboardProps {
  userProfile: UserProfile;
  onNewLesson: () => void;
}

export const Leaderboard = ({ userProfile, onNewLesson }: LeaderboardProps) => {
  // Update user data in mock leaderboard
  const leaderboardData = mockLeaderboardData.map(user => 
    user.name === "You" 
      ? { ...user, score: userProfile.score, level: userProfile.level, field: userProfile.field }
      : user
  ).sort((a, b) => b.score - a.score).map((user, index) => ({ ...user, rank: index + 1 }));

  const userRank = leaderboardData.find(user => user.name === "You")?.rank || 0;

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
          {leaderboardData.slice(0, 10).map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                user.name === "You" 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Rank Icon */}
              <div className="flex-shrink-0">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className={user.name === "You" ? "bg-primary text-primary-foreground" : ""}>
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${user.name === "You" ? "text-primary" : "text-foreground"}`}>
                    {user.name}
                  </span>
                  {user.name === "You" && <Badge variant="default">You</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.field}</span>
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
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="p-2 bg-success/20 rounded-full">
                <BookOpen className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="font-medium text-success">First Quiz!</div>
                <div className="text-sm text-muted-foreground">Completed your first quiz</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted opacity-50">
              <div className="p-2 bg-muted rounded-full">
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Perfect Score</div>
                <div className="text-sm text-muted-foreground">Score 100% on a quiz</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted opacity-50">
              <div className="p-2 bg-muted rounded-full">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Level Up</div>
                <div className="text-sm text-muted-foreground">Reach level 5</div>
              </div>
            </div>
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