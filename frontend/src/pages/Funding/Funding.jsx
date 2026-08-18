import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Search as SearchIcon, Bookmark as BookmarkIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import fundingService from '../../services/fundingService';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Funding() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [useExternalApi, setUseExternalApi] = useState(true);

  const [allFunding, setAllFunding] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedFunding, setSavedFunding] = useState([]);
  const [appliedFunding, setAppliedFunding] = useState([]);

  useEffect(() => {
    loadFundingData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        loadFundingData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = async (search) => {
    try {
      setSearchLoading(true);
      const results = await fundingService.getAllFunding(search, useExternalApi);
      setAllFunding(results);
      
      if (useExternalApi && results.length === 0) {
        setError('External APIs returned no results. Try searching with different keywords or disable external API to search local database.');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadFundingData = async (search = '') => {
    try {
      setLoading(true);
      
      const [all, rec, saved, applied] = await Promise.all([
        fundingService.getAllFunding(search).catch(() => []),
        fundingService.getRecommendations(user?.id || 1).catch(() => []),
        fundingService.getSavedFunding().catch(() => []),
        fundingService.getAppliedFunding().catch(() => [])
      ]);

      setAllFunding(all);
      setRecommendations(rec);
      setSavedFunding(saved);
      setAppliedFunding(applied);
    } catch (err) {
      setError('Failed to load funding data');
      console.error('Funding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (fundingId) => {
    try {
      await fundingService.saveFunding(fundingId);
      await loadFundingData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save funding opportunity');
    }
  };

  const handleApply = async (fundingId) => {
    try {
      await fundingService.applyFunding(fundingId);
      await loadFundingData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to apply for funding');
    }
  };



  const renderFundingCard = (funding, showScore = false) => (
    <Grid item xs={12} md={6} lg={4} key={funding.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: showScore && funding.match_score !== undefined
              ? funding.match_score >= 70
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : funding.match_score >= 50
                  ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
                  : 'linear-gradient(90deg, #6B7280 0%, #9CA3AF 100%)'
              : 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
            opacity: 0.8
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.15)',
            borderColor: 'rgba(124, 58, 237, 0.3)',
            '&::before': {
              opacity: 1,
              height: '4px'
            }
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              noWrap
              sx={{
                color: 'white',
                fontSize: '1.1rem',
                lineHeight: 1.4
              }}
            >
              {funding.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={funding.agency}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#A78BFA',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
              {showScore && funding.match_score !== undefined && (
                <Chip
                  label={`${Math.round(funding.match_score)}% Match`}
                  size="small"
                  sx={{
                    ml: 1,
                    background: funding.match_score >= 70
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                      : funding.match_score >= 50
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.1) 100%)',
                    border: funding.match_score >= 70
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : funding.match_score >= 50
                        ? '1px solid rgba(245, 158, 11, 0.3)'
                        : '1px solid rgba(107, 114, 128, 0.3)',
                    color: funding.match_score >= 70
                      ? '#34D399'
                      : funding.match_score >= 50
                        ? '#FBBF24'
                        : '#9CA3AF',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 100 }}>
                Research Area:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                {funding.research_area}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 100 }}>
                Amount:
              </Typography>
              <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                ${funding.amount?.toLocaleString() || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 100 }}>
                Deadline:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                {funding.deadline ? new Date(funding.deadline).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>

            {funding.country && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 100 }}>
                  Country:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                  {funding.country}
                </Typography>
              </Box>
            )}
          </Box>

          {funding.keywords && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, mb: 0.5, display: 'block' }}>
                Keywords:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(() => {
                  // Handle both string and array keywords
                  const keywordArray = Array.isArray(funding.keywords) 
                    ? funding.keywords 
                    : funding.keywords.split(',').map(k => k.trim()).filter(k => k);
                  
                  return keywordArray.slice(0, 3).map((keyword, idx) => (
                    <Chip
                      key={idx}
                      label={keyword}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(124, 58, 237, 0.3)',
                        color: 'rgba(167, 139, 250, 0.9)',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  ));
                })()}
                {(() => {
                  const keywordArray = Array.isArray(funding.keywords) 
                    ? funding.keywords 
                    : funding.keywords.split(',').map(k => k.trim()).filter(k => k);
                  
                  return keywordArray.length > 3 && (
                    <Chip
                      label={`+${keywordArray.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(124, 58, 237, 0.3)',
                        color: 'rgba(167, 139, 250, 0.9)',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  );
                })()}
              </Box>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.5,
              fontSize: '0.875rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {funding.description?.substring(0, 150)}...
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            p: 2,
            pt: 0,
            gap: 1,
            borderTop: '1px solid rgba(124, 58, 237, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <Button
            size="small"
            startIcon={<BookmarkIcon />}
            onClick={() => handleSave(funding.id)}
            disabled={savedFunding.some(s => (s.id || s.funding_id) === funding.id)}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              px: 2,
              background: savedFunding.some(s => (s.id || s.funding_id) === funding.id)
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'rgba(124, 58, 237, 0.1)',
              border: savedFunding.some(s => (s.id || s.funding_id) === funding.id)
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(124, 58, 237, 0.3)',
              color: savedFunding.some(s => (s.id || s.funding_id) === funding.id)
                ? '#34D399'
                : '#A78BFA',
              '&:hover': {
                background: savedFunding.some(s => (s.id || s.funding_id) === funding.id)
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(124, 58, 237, 0.2)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }
            }}
          >
            {savedFunding.some(s => (s.id || s.funding_id) === funding.id) ? 'Saved' : 'Save'}
          </Button>

          {savedFunding.some(s => (s.id || s.funding_id) === funding.id) && (
            <Button
              size="small"
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => handleApply(funding.id)}
              disabled={appliedFunding.some(a => (a.id || a.funding_id) === funding.id)}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                px: 2,
                background: appliedFunding.some(a => (a.id || a.funding_id) === funding.id)
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                border: appliedFunding.some(a => (a.id || a.funding_id) === funding.id)
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : 'none',
                color: appliedFunding.some(a => (a.id || a.funding_id) === funding.id)
                  ? '#34D399'
                  : 'white',
                '&:hover': {
                  background: appliedFunding.some(a => (a.id || a.funding_id) === funding.id)
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)'
                },
                '&:disabled': {
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {appliedFunding.some(a => (a.id || a.funding_id) === funding.id) ? 'Applied' : 'Apply'}
            </Button>
          )}

          {funding.application_url && (
            <Button
              size="small"
              href={funding.application_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ml: 'auto',
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                px: 2,
                color: '#A78BFA',
                '&:hover': {
                  background: 'rgba(124, 58, 237, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              View Details
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          borderRadius: 3
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight={700}
            sx={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Funding Opportunities
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Discover and apply for research funding opportunities
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              '& .MuiAlert-icon': {
                color: '#EF4444'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)',
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.95rem',
              '&:hover': {
                color: 'rgba(255, 255, 255, 0.9)'
              },
              '&.Mui-selected': {
                color: '#A78BFA'
              }
            }
          }}
        >
          <Tab label="All Opportunities" />
          <Tab label="Recommended" />
          <Tab label="Saved" />
          <Tab label="Applied" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by title, agency, research area, keywords, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(124, 58, 237, 0.05)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: 2,
                  color: 'white',
                  '&:hover': {
                    border: '1px solid rgba(124, 58, 237, 0.4)'
                  },
                  '&.Mui-focused': {
                    background: 'rgba(124, 58, 237, 0.08)',
                    border: '1px solid rgba(124, 58, 237, 0.6)',
                    boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)'
                  }
                },
                '& .MuiInputAdornment-root': {
                  color: 'rgba(255, 255, 255, 0.6)'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              helperText={searchTerm ? `Found ${allFunding.length} result${allFunding.length !== 1 ? 's' : ''}` : ''}
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useExternalApi}
                    onChange={(e) => setUseExternalApi(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#7C3AED',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(124, 58, 237, 0.5)',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Use External Government APIs (NSF, NIH, Grants.gov)
                  </Typography>
                }
              />
              {useExternalApi && (
                <Chip
                  label="External API Active"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
          </Box>
          {searchLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress sx={{ color: '#7C3AED' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {allFunding.length > 0 ? (
                allFunding.map(funding => renderFundingCard(funding))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      px: 4,
                      background: 'rgba(124, 58, 237, 0.05)',
                      border: '1px dashed rgba(124, 58, 237, 0.3)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {searchTerm ? 'No funding opportunities match your search' : 'No funding opportunities available'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {recommendations.length > 0 ? (
              recommendations.map(funding => renderFundingCard(funding, true))
            ) : (
              <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 4,
                    background: 'rgba(124, 58, 237, 0.05)',
                    border: '1px dashed rgba(124, 58, 237, 0.3)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No recommendations available. Complete your profile to get personalized recommendations.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {savedFunding.length > 0 ? (
              savedFunding.map(funding => renderFundingCard(funding))
            ) : (
              <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 4,
                    background: 'rgba(124, 58, 237, 0.05)',
                    border: '1px dashed rgba(124, 58, 237, 0.3)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No saved funding opportunities
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {appliedFunding.length > 0 ? (
              appliedFunding.map(funding => renderFundingCard(funding))
            ) : (
              <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    px: 4,
                    background: 'rgba(124, 58, 237, 0.05)',
                    border: '1px dashed rgba(124, 58, 237, 0.3)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No applied funding opportunities
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Funding;