const express = require('express');
const router = express.Router();
const { apiGet } = require('../services/footballApi');

// GET /api/results
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching latest results...');
    let rawResponse = [];

    // Attempt multiple strategies to fetch data
    const strategies = [
      { name: 'last 50', params: { last: 50 } },
      { 
        name: 'today', 
        getParams: () => ({ date: new Date().toISOString().split('T')[0] }) 
      },
      { 
        name: 'yesterday', 
        getParams: () => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return { date: yesterday.toISOString().split('T')[0] };
        }
      },
      { name: 'last 100', params: { last: 100 } }
    ];

    for (const strategy of strategies) {
      // Skip if we already have data
      if (rawResponse && rawResponse.length > 0) break;

      try {
        const params = strategy.params || strategy.getParams();
        const result = await apiGet('/fixtures', params);
        
        // Only update if we got a valid array
        if (Array.isArray(result) && result.length > 0) {
          rawResponse = result;
          console.log(`✅ Got ${result.length} matches from ${strategy.name}`);
        }
      } catch (err) {
        console.warn(`⚠️ Strategy "${strategy.name}" failed:`, err.message);
      }
    }

    // Safely filter finished matches
    const finishedMatches = (Array.isArray(rawResponse) ? rawResponse : [])
      .filter(match => {
        const status = match.fixture?.status?.short || match.status?.short;
        return ['FT', 'AET', 'PEN', 'FINISHED'].includes(status);
      });

    console.log(`✅ Found ${finishedMatches.length} finished matches`);

    // If real data is empty, serve sample data immediately
    if (finishedMatches.length === 0) {
      console.log('📝 No finished matches found. Returning sample data.');
      return res.json({
        success: true,
        matches: getSampleMatches(),
        isSampleData: true
      });
    }

    // Transform matches to a consistent frontend format
    const formattedMatches = finishedMatches.map(match => {
      const fixture = match.fixture || match;
      const league = match.league || {};
      const teams = match.teams || {};
      const goals = match.goals || {};
      const status = fixture.status || {};

      return {
        id: fixture.id || match.id,
        date: fixture.date || match.date,
        status: {
          short: status.short || 'FT',
          long: status.long || 'Match Finished'
        },
        league: {
          name: league.name || 'Unknown League',
          logo: league.logo || ''
        },
        teams: {
          home: {
            name: teams.home?.name || 'Home Team',
            logo: teams.home?.logo || ''
          },
          away: {
            name: teams.away?.name || 'Away Team',
            logo: teams.away?.logo || ''
          }
        },
        goals: {
          home: goals.home != null ? goals.home : 0,
          away: goals.away != null ? goals.away : 0
        }
      };
    });

    return res.json({
      success: true,
      matches: formattedMatches,
      isSampleData: false,
      count: formattedMatches.length
    });

  } catch (error) {
    console.error('❌ Critical error in /api/results:', error.message);
    // Always fall back to sample data if anything crashes
    return res.json({
      success: true,
      matches: getSampleMatches(),
      isSampleData: true,
      error: error.message
    });
  }
});

// Sample data for testing/fallback
function getSampleMatches() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    {
      id: 1,
      date: yesterday.toISOString(),
      status: { short: 'FT', long: 'Match Finished' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
      teams: {
        home: { name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
        away: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }
      },
      goals: { home: 2, away: 1 }
    },
    {
      id: 2,
      date: twoDaysAgo.toISOString(),
      status: { short: 'FT', long: 'Match Finished' },
      league: { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
      teams: {
        home: { name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
        away: { name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' }
      },
      goals: { home: 3, away: 0 }
    },
    {
      id: 3,
      date: twoDaysAgo.toISOString(),
      status: { short: 'FT', long: 'Match Finished' },
      league: { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
      teams: {
        home: { name: 'Bayern Munich', logo: 'https://media.api-sports.io/football/teams/157.png' },
        away: { name: 'Borussia Dortmund', logo: 'https://media.api-sports.io/football/teams/165.png' }
      },
      goals: { home: 4, away: 2 }
    },
    {
      id: 4,
      date: twoDaysAgo.toISOString(),
      status: { short: 'FT', long: 'Match Finished' },
      league: { name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
      teams: {
        home: { name: 'AC Milan', logo: 'https://media.api-sports.io/football/teams/489.png' },
        away: { name: 'Inter Milan', logo: 'https://media.api-sports.io/football/teams/505.png' }
      },
      goals: { home: 1, away: 1 }
    },
    {
      id: 5,
      date: new Date(today.setHours(today.getHours() - 3)).toISOString(),
      status: { short: 'FT', long: 'Match Finished' },
      league: { name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
      teams: {
        home: { name: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png' },
        away: { name: 'Marseille', logo: 'https://media.api-sports.io/football/teams/81.png' }
      },
      goals: { home: 2, away: 0 }
    }
  ];
}

module.exports = router;