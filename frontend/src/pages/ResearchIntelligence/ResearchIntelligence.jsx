import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import researchIntelligenceService from '../../services/researchIntelligenceService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function ResearchIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    loadResearchIntelligence();
  }, []);

  const loadResearchIntelligence = async () => {
    try {
      setLoading(true);
      const researchData = await researchIntelligenceService.getDashboard();
      setData(researchData);
    } catch (err) {
      setError('Failed to load research intelligence data');
      console.error('Research Intelligence error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const publicationTrendData = data?.publication_trends?.map(trend => ({
    year: trend.year,
    publications: trend.publication_count
  })) || [];

  const stats = [
    {
      title: 'Researcher',
      value: data?.researcher || 'N/A',
      icon: <ScienceIcon />,
      color: '#6C63FF'
    },
    {
      title: 'Research Domain',
      value: data?.research_domain || 'N/A',
      icon: <TrendingUpIcon />,
      color: '#3F8CFF'
    },
    {
      title: 'Total Publications',
      value: data?.publication_count || 0,
      icon: <AssessmentIcon />,
      color: '#00B894'
    },
    {
      title: 'Total Patents',
      value: data?.patent_count || 0,
      icon: <LightbulbIcon />,
      color: '#F39C12'
    },
    {
      title: 'Saved Funding',
      value: data?.saved_funding || 0,
      icon: <AssessmentIcon />,
      color: '#E74C3C'
    },
    {
      title: 'Applied Funding',
      value: data?.applied_funding || 0,
      icon: <TrendingUpIcon />,
      color: '#9B59B6'
    },
    {
      title: 'Recommendations',
      value: data?.total_recommendations || 0,
      icon: <LightbulbIcon />,
      color: '#1ABC9C'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Research Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics and insights for your research performance
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Publication Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your publication output over the years
            </Typography>
            {publicationTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={publicationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="publications" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Publications"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No publication trend data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Funding Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your funding activity summary
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Saved Opportunities
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#3F8CFF">
                  {data?.saved_funding || 0}
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Applied Opportunities
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#00B894">
                  {data?.applied_funding || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available Recommendations
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="#F39C12">
                  {data?.total_recommendations || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ResearchIntelligence;