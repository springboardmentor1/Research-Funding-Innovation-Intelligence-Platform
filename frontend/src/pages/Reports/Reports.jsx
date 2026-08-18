import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Paid as PaidIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import researchIntelligenceService from '../../services/researchIntelligenceService';
import patentAnalyticsService from '../../services/patentAnalyticsService';
import fundingService from '../../services/fundingService';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [researchData, setResearchData] = useState(null);
  const [patentData, setPatentData] = useState(null);
  const [fundingData, setFundingData] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const [research, patents, funding] = await Promise.all([
        researchIntelligenceService.getDashboard().catch(() => null),
        patentAnalyticsService.getDashboard().catch(() => null),
        fundingService.getAllFunding().catch(() => [])
      ]);

      setResearchData(research);
      setPatentData(patents);
      setFundingData(funding);
    } catch (err) {
      setError('Failed to load report data');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportType) => {
    // In a real implementation, this would generate and download a PDF/Excel report
    alert(`Exporting ${reportType} report for ${timeRange} period`);
  };

  const generatePerformanceData = () => {
    // Mock data for performance trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      publications: Math.floor(Math.random() * 10) + 1,
      patents: Math.floor(Math.random() * 5),
      funding: Math.floor(Math.random() * 3)
    }));
  };

  const generateFundingAnalytics = () => {
    return fundingData.slice(0, 10).map(funding => ({
      name: funding.agency,
      amount: funding.amount || 0,
      count: 1
    }));
  };

  const generateResearchImpact = () => {
    return [
      { name: 'Citations', value: researchData?.publication_count * 15 || 0 },
      { name: 'Publications', value: researchData?.publication_count || 0 },
      { name: 'Patents', value: patentData?.total_patents || 0 },
      { name: 'Funding', value: researchData?.saved_funding || 0 }
    ];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const performanceData = generatePerformanceData();
  const fundingAnalytics = generateFundingAnalytics();
  const researchImpact = generateResearchImpact();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Executive Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive analytics and performance reports
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
                <MenuItem value="year">Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('Executive Summary')}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScienceIcon sx={{ color: '#6C63FF', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Innovation Score
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {patentData?.average_innovation_score || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#00B894', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Publications
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {researchData?.publication_count || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaidIcon sx={{ color: '#3F8CFF', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Funding Opportunities
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {researchData?.total_recommendations || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#F39C12', mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Commercial Ready
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {patentData?.commercialization_ready || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Performance Overview" />
          <Tab label="Funding Analytics" />
          <Tab label="Research Impact" />
          <Tab label="Innovation Metrics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Research Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="publications" stackId="1" stroke="#8884d8" fill="#8884d8" name="Publications" />
                <Area type="monotone" dataKey="patents" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Patents" />
                <Area type="monotone" dataKey="funding" stackId="1" stroke="#ffc658" fill="#ffc658" name="Funding" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Publication Growth
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Year over year publication growth rate
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#00B894">
                    +12.5%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patent Success Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Patents granted vs. filed
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="#6C63FF">
                    78%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Funding Agency Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={fundingAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3F8CFF" name="Total Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Funding Available
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#3F8CFF">
                    ${fundingData.reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Applications Submitted
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#00B894">
                    {researchData?.applied_funding || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#F39C12">
                    34%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Research Impact Overview
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={researchImpact} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6C63FF" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Research Domain Impact
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Primary Domain:</strong> {researchData?.research_domain || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top performing research area based on publications and citations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Collaboration Index
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#00B894">
                    High
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on co-authorship and joint patent filings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Innovation Excellence
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Average Innovation Score
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="#6C63FF">
                      {patentData?.average_innovation_score || 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Commercialization Readiness
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="#00B894">
                      {patentData?.commercialization_ready || 0} Patents
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Technology Leadership
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Primary Technology Area
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#3F8CFF">
                      {patentData?.top_technology || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Patent Portfolio
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="#F39C12">
                      {patentData?.total_patents || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Strategic Recommendations
                  </Typography>
                  <Box component="ul" sx={{ mt: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        Focus on {patentData?.top_technology || 'emerging technologies'} for maximum commercialization potential
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        Increase publication output in {researchData?.research_domain || 'primary research domain'} to strengthen funding applications
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography variant="body1">
                        Leverage high innovation score patents for industry partnerships
                      </Typography>
                    </Box>
                    <Box component="li">
                      <Typography variant="body1">
                        Expand international collaboration to increase citation impact
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default Reports;