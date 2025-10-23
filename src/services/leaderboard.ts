import { UserProfile } from "@/components/learning/LearningDashboard";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, Attempt } from '../types/models';

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

/**
 * Fetches actual leaderboard data from Firestore
 * Calculates scores based on quiz attempts and user profiles
 */
export const fetchLeaderboardData = async (userId: string): Promise<LeaderboardUser[]> => {
  try {
    console.log('📊 Fetching leaderboard data from Firestore...');
    
    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('⚠️ No users found in Firestore');
      return [];
    }

    // Process users and calculate their scores
    const userPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data() as User;
      
      try {
        // Get all quiz attempts for this user
        const attemptsSnapshot = await getDocs(
          query(
            collection(db, 'attempts'),
            where('userId', '==', userDoc.id)
          )
        );

        // Calculate total score from quiz attempts
        let totalScore = 0;
        let streak = 1;
        
        if (!attemptsSnapshot.empty) {
          const attempts = attemptsSnapshot.docs.map(doc => doc.data() as Attempt);
          
          // Sort by timestamp descending to get recent attempts
          attempts.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          // Sum scores from all attempts
          totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
          
          // Calculate streak based on consecutive days with attempts
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let currentStreak = 0;
          for (let i = 0; i < attempts.length; i++) {
            const attemptDate = new Date(attempts[i].timestamp);
            attemptDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (attemptDate.getTime() === expectedDate.getTime()) {
              currentStreak++;
            } else {
              break;
            }
          }
          
          streak = currentStreak > 0 ? currentStreak : 1;
        }

        // Calculate level based on score (every 500 points = 1 level)
        const level = Math.floor(totalScore / 500) + 1;

        return {
          id: userDoc.id,
          name: userData.name || 'Unknown User',
          score: totalScore,
          level,
          field: (userData.learningStyles && userData.learningStyles[0]) || 'General',
          streak,
          isCurrentUser: userDoc.id === userId
        };
      } catch (error) {
        console.error(`Error processing user ${userDoc.id}:`, error);
        return null;
      }
    });

    const users = (await Promise.all(userPromises)).filter(user => user !== null) as LeaderboardUser[];

    // Sort by score (descending) and assign ranks
    const rankedUsers = users
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    console.log(`✅ Leaderboard loaded: ${rankedUsers.length} users, top score: ${rankedUsers[0]?.score || 0}`);
    return rankedUsers;
  } catch (error) {
    console.error('❌ Error fetching leaderboard data:', error);
    return [];
  }
};

/**
 * Gets leaderboard with user's position guaranteed to be visible
 */
export const getLeaderboardWithUserVisible = async (
  userProfile: UserProfile,
  userId: string,
  maxVisibleItems = 10
): Promise<LeaderboardUser[]> => {
  try {
    const allRankedUsers = await fetchLeaderboardData(userId);
    
    if (allRankedUsers.length === 0) {
      return [];
    }
    
    const currentUser = allRankedUsers.find(user => user.isCurrentUser);
    
    if (!currentUser) {
      return allRankedUsers.slice(0, maxVisibleItems);
    }
    
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
  } catch (error) {
    console.error('❌ Error getting leaderboard with user visible:', error);
    return [];
  }
};

// Get achievements based on user's progress
export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: string;
}

export const getUserAchievements = async (userProfile: UserProfile, userId: string): Promise<Achievement[]> => {
  try {
    // Get user's attempts to determine achievements
    const attemptsSnapshot = await getDocs(
      query(
        collection(db, 'attempts'),
        where('userId', '==', userId)
      )
    );

    const attempts = attemptsSnapshot.docs.map(doc => doc.data() as Attempt);
    
    // Check for perfect scores (100%)
    const hasPerfectScore = attempts.some(attempt => attempt.score === 100);
    
    // Check for multiple attempts
    const hasMultipleAttempts = attempts.length >= 5;
    
    // Calculate total score
    const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    
    // Calculate level
    const level = Math.floor(totalScore / 500) + 1;

    return [
      {
        id: "first-quiz",
        title: "First Quiz!",
        description: "Completed your first quiz",
        isUnlocked: attempts.length > 0,
        icon: "BookOpen"
      },
      {
        id: "perfect-score",
        title: "Perfect Score",
        description: "Score 100% on a quiz",
        isUnlocked: hasPerfectScore,
        icon: "Star"
      },
      {
        id: "level-up",
        title: "Level Up",
        description: "Reach level 5",
        isUnlocked: level >= 5,
        icon: "TrendingUp"
      },
      {
        id: "quiz-master",
        title: "Quiz Master",
        description: "Complete 5 quizzes",
        isUnlocked: hasMultipleAttempts,
        icon: "Trophy"
      }
    ];
  } catch (error) {
    console.error('❌ Error fetching achievements:', error);
    // Return default unlocked achievements if error occurs
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
        isUnlocked: false,
        icon: "Star"
      },
      {
        id: "level-up",
        title: "Level Up",
        description: "Reach level 5",
        isUnlocked: userProfile.level >= 5,
        icon: "TrendingUp"
      },
      {
        id: "quiz-master",
        title: "Quiz Master",
        description: "Complete 5 quizzes",
        isUnlocked: false,
        icon: "Trophy"
      }
    ];
  }
};
