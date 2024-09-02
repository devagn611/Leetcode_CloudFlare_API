/**
 * LeetCode Statistics Worker
 * 
 * This worker fetches and serves LeetCode statistics for a given user.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response('Please provide a LeetCode username as a query parameter. Example:/?username=devagn_maniya ', { status: 400 });
    }

    try {
      const leetCodeStats = await fetchLeetCodeStats(username);
      return new Response(JSON.stringify(leetCodeStats), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(`Error fetching LeetCode stats: ${error.message}`, { status: 500 });
    }
  },
};

async function fetchLeetCodeStats(username) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        problemsSolvedBeatsStats {
          difficulty
          percentage
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
        profile {
          realName
          countryName
          skillTags
          company
          school
          starRating
          aboutMe
          userAvatar
          reputation
          ranking
        }
      }
    }
  `;

  const variables = { username };

  const response = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://leetcode.com/',
      'Origin': 'https://leetcode.com'
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}
