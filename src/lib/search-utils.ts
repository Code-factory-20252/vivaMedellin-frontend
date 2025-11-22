/**
 * Utility functions for user search functionality
 */

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Searches for users by username or name
 * @param query - The search query
 * @returns Promise with search results
 */
export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) {
    return { data: [], error: null };
  }

  try {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);

    if (!response.ok) {
      throw new Error('Search request failed');
    }

    const data = await response.json();
    return { data: data.users || [], error: null };
  } catch (error) {
    console.error('Error searching users:', error);
    return { data: [], error: 'Failed to search users' };
  }
}

/**
 * Follows a user
 * @param userId - The ID of the user to follow
 * @returns Promise with follow result
 */
export async function followUser(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return { data, error: response.ok ? null : data.error };
  } catch (error) {
    console.error('Error following user:', error);
    return { data: null, error: 'Failed to follow user' };
  }
}

/**
 * Unfollows a user
 * @param userId - The ID of the user to unfollow
 * @returns Promise with unfollow result
 */
export async function unfollowUser(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}/follow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return { data, error: response.ok ? null : data.error };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { data: null, error: 'Failed to unfollow user' };
  }
}

/**
 * Gets the list of users that a specific user is following
 * @param userId - The ID of the user
 * @returns Promise with following list
 */
export async function getFollowing(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}/following`);

    if (!response.ok) {
      throw new Error('Failed to fetch following list');
    }

    const data = await response.json();
    return { data: data.following || [], error: null };
  } catch (error) {
    console.error('Error fetching following:', error);
    return { data: [], error: 'Failed to fetch following list' };
  }
}
