import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import {
  Gavel as PatentIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Public as PublicIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import patentAnalyticsService from '../../services/patentAnalyticsService';
import patentService from '../../services/patentService';
import PatentForm from '../../components/patent/PatentForm';
import PatentSearch from '../../components/patent/PatentSearch';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Patent() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [landscapeData, setLandscapeData] = useState(null);
  const [technologyData, setTechnologyData] = useState([]);
  const [patents, setPatents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadPatentData();
  }, []);

  const loadPatentData = async () => {
    try {
      setLoading(true);
      
      const [dashboard, landscape, technology, allPatents] = await Promise.all([
        patentAnalyticsService.getDashboard().catch(() => null),
        patentAnalyticsService.getLandscape().catch(() => null),
        patentAnalyticsService.getTechnologyIntelligence().catch(() => []),
        patentService.getAllPatents().catch(() => [])
      ]);

      setDashboardData(dashboard);
      setLandscapeData(landscape);
      setTechnologyData(technology);
      setPatents(allPatents);
    } catch (err) {
      setError('Failed to load patent data');
      console.error('Patent error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCommercializationRecommendation = async (patentId) => {
    try {
      const recommendation = await patentAnalyticsService.getCommercializationRecommendation(patentId);
      alert(`Recommendation: ${recommendation.recommendation}\nInnovation Score: ${recommendation.innovation_score}`);
    } catch (err) {
      setError('Failed to get commercialization recommendation');
    }
  };

  const getInnovationScore = async (patentId) => {
    try {
      const score = await patentAnalyticsService.getInnovationScore(patentId);
      alert(`Innovation Score: ${score.innovation_score}`);
    } catch (err) {
      setError('Failed to get innovation score');
    }
  };

  const handlePatentAdded = useCallback(() => {
    loadPatentData();
  }, []);

  const handlePatentsImported = useCallback(() => {
    loadPatentData();
  }, []);

  const handleCloseAddForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  const handleDeletePatent = async (patentId) => {
    if (!window.confirm('Are you sure you want to delete this patent?')) {
      return;
    }

    try {
      await patentService.deletePatent(patentId);
      loadPatentData();
    } catch (err) {
      setError('Failed to delete patent');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const technologyDistributionData = Object.entries(landscapeData?.technology_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const countryDistributionData = Object.entries(landscapeData?.country_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const statusDistributionData = Object.entries(landscapeData?.status_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Patent Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze your patent portfolio and innovation potential
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: '#6C63FF20',
                    color: '#6C63FF',
                    mr: 2
                  }}>
                    <PatentIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Patents
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboardData?.total_patents || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: '#3F8CFF20',
                    color: '#3F8CFF',
                    mr: 2
                  }}>
                    <TrendingUpIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Innovation Score
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboardData?.average_innovation_score || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: '#00B89420',
                    color: '#00B894',
                    mr: 2
                  }}>
                    <LightbulbIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Commercial Ready
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {dashboardData?.commercialization_ready || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    bgcolor: '#F39C1220',
                    color: '#F39C12',
                    mr: 2
                  }}>
                    <AssessmentIcon />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Top Technology
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {dashboardData?.top_technology || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setShowSearch(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              px: 3,
              borderColor: 'rgba(124, 58, 237, 0.3)',
              color: '#A78BFA',
              '&:hover': {
                background: 'rgba(124, 58, 237, 0.1)',
                borderColor: 'rgba(124, 58, 237, 0.5)',
              },
            }}
          >
            Search & Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
              },
            }}
          >
            Add Patent
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Dashboard" />
          <Tab label="Patent Landscape" />
          <Tab label="Technology Intelligence" />
          <Tab label="All Patents" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Technology Distribution
              </Typography>
              {technologyDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={technologyDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {technologyDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No technology distribution data available
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Status Distribution
              </Typography>
              {statusDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No status distribution data available
                </Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Technology Areas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Technology</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(landscapeData?.technology_distribution || {}).map(([tech, count]) => (
                      <TableRow key={tech}>
                        <TableCell>{tech}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Geographic Distribution
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(landscapeData?.country_distribution || {}).map(([country, count]) => (
                      <TableRow key={country}>
                        <TableCell>{country}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Technology Intelligence
          </Typography>
          <Grid container spacing={3}>
            {technologyData.length > 0 ? (
              technologyData.map((tech, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {tech.technology}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <PublicIcon sx={{ mr: 1, color: '#3F8CFF' }} />
                        <Typography variant="body2" color="text.secondary">
                          {tech.patent_count} patents
                        </Typography>
                      </Box>
                      <Chip
                        label={tech.trend}
                        color={
                          tech.trend === 'High Growth' ? 'success' :
                          tech.trend === 'Growing' ? 'info' :
                          tech.trend === 'Emerging' ? 'warning' : 'default'
                        }
                        size="small"
                        sx={{ mt: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No technology intelligence data available
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            All Patents
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Technology Area</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patents.length > 0 ? (
                  patents.map((patent) => (
                    <TableRow key={patent.id}>
                      <TableCell>{patent.title}</TableCell>
                      <TableCell>{patent.technology_area}</TableCell>
                      <TableCell>{patent.country}</TableCell>
                      <TableCell>
                        <Chip
                          label={patent.status}
                          size="small"
                          color={patent.status === 'Granted' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => getInnovationScore(patent.id)}
                          >
                            Score
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => getCommercializationRecommendation(patent.id)}
                          >
                            Analyze
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeletePatent(patent.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No patents found. Click "Add Patent" or "Search & Import" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Add Patent Dialog */}
      {showAddForm && (
        <PatentForm
          onPatentAdded={handlePatentAdded}
          onClose={handleCloseAddForm}
        />
      )}

      {/* Patent Search Dialog */}
      {showSearch && (
        <PatentSearch
          onPatentsImported={handlePatentsImported}
          onClose={handleCloseSearch}
        />
      )}
    </Container>
  );
}

export default Patent;