import { UserProfile } from "@/components/learning/LearningDashboard";

// Define leaderboard user interface
export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  level: number;
  field: string;
  streak: number;
  rank?: number;
  isCurrentUser?: boolean;
}

// In a real app, this would be fetched from a backend API
const generateLeaderboardData = (userProfile: UserProfile): LeaderboardUser[] => {
  // Base data (would come from an API in a real application)
  const baseUsers: LeaderboardUser[] = [
    { id: "user1", name: "Alex Chen", score: 2450, level: 25, field: "Web Development", streak: 12 },
    { id: "user2", name: "Sarah Johnson", score: 2380, level: 24, field: "Data Science", streak: 8 },
    { id: "user3", name: "Mike Rodriguez", score: 2250, level: 23, field: "Digital Marketing", streak: 15 },
    { id: "user4", name: "Emma Wilson", score: 2100, level: 21, field: "Graphic Design", streak: 6 },
    { id: "user6", name: "David Kim", score: 1980, level: 20, field: "Business Strategy", streak: 9 },
    { id: "user7", name: "Lisa Zhang", score: 1850, level: 19, field: "Machine Learning", streak: 4 },
    { id: "user8", name: "James Miller", score: 1720, level: 18, field: "Web Development", streak: 7 },
    { id: "user9", name: "Taylor Adams", score: 1650, level: 17, field: "Mobile Development", streak: 5 },
    { id: "user10", name: "Sofia Garcia", score: 1520, level: 16, field: "UX Design", streak: 3 },
    { id: "user11", name: "Jordan Lee", score: 1430, level: 15, field: "Python Programming", streak: 6 },
    { id: "user12", name: "Riley Smith", score: 1380, level: 14, field: "JavaScript", streak: 4 },
  ];

  // Create current user
  const currentUser: LeaderboardUser = {
    id: "currentUser",
    name: "You",
    score: userProfile.score,
    level: userProfile.level,
    field: userProfile.field,
    streak: 1, // This would be tracked in a real app
    isCurrentUser: true
  };

  // Merge and sort
  const allUsers = [...baseUsers, currentUser]
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));

  return allUsers;
};

// Function to get leaderboard data with the user's position guaranteed to be visible
export const getLeaderboardWithUserVisible = (
  userProfile: UserProfile,
  maxVisibleItems = 10
): LeaderboardUser[] => {
  const allRankedUsers = generateLeaderboardData(userProfile);
  const currentUser = allRankedUsers.find(user => user.isCurrentUser);
  
  if (!currentUser) return allRankedUsers.slice(0, maxVisibleItems);
  
  // If user is already in top positions, just return top N
  if (currentUser.rank! <= maxVisibleItems) {
    return allRankedUsers.slice(0, maxVisibleItems);
  }
  
  // Otherwise, include top positions and user's position with neighbors
  const topUsers = allRankedUsers.slice(0, maxVisibleItems - 3);
  const userIndex = allRankedUsers.findIndex(u => u.isCurrentUser);
  let userSection: LeaderboardUser[] = [];
  
  // Get user and adjacent entries
  if (userIndex > 0 && userIndex < allRankedUsers.length - 1) {
    userSection = allRankedUsers.slice(userIndex - 1, userIndex + 2);
  } else if (userIndex === 0) {
    userSection = allRankedUsers.slice(0, 3);
  } else {
    userSection = allRankedUsers.slice(allRankedUsers.length - 3);
  }
  
  return [...topUsers, ...userSection];
};

// Get achievements based on user's progress
export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: string;
}

export const getUserAchievements = (userProfile: UserProfile): Achievement[] => {
  return [
    {
      id: "first-quiz",
      title: "First Quiz!",
      description: "Completed your first quiz",
      isUnlocked: userProfile.score > 0,
      icon: "BookOpen"
    },
    {
      id: "perfect-score",
      title: "Perfect Score",
      description: "Score 100% on a quiz",
      isUnlocked: userProfile.score >= 100, // This logic would be more sophisticated in a real app
      icon: "Star"
    },
    {
      id: "level-up",
      title: "Level Up",
      description: "Reach level 5",
      isUnlocked: userProfile.level >= 5,
      icon: "TrendingUp"
    }
  ];
};
