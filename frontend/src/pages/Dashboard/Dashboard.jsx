import React, { useState, useEffect } from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Icons
import ScienceIcon from "@mui/icons-material/Science";
import PaidIcon from "@mui/icons-material/Paid";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";

// Components
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/cards/StatCard";

import PublicationTrendsChart from "../../components/dashboard/charts/FundingChart";
import PatentChart from "../../components/dashboard/charts/PatentChart";

import AIInsights from "../../components/dashboard/widgets/AIInsights";
import ActivityTimeline from "../../components/dashboard/widgets/ActivityTimeline";

import FundingTable from "../../components/dashboard/tables/FundingTable";
import PublicationsTable from "../../components/dashboard/tables/PublicationsTable";

import dashboardService from "../../services/dashboardService";
import researchIntelligenceService from "../../services/researchIntelligenceService";
import patentAnalyticsService from "../../services/patentAnalyticsService";
import fundingService from "../../services/fundingService";
import publicationService from "../../services/publicationService";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [patentData, setPatentData] = useState(null);
  const [fundingData, setFundingData] = useState([]);
  const [technologyIntelligenceData, setTechnologyIntelligenceData] = useState([]);
  const [publicationsData, setPublicationsData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel with error handling for each service
      const [dashboard, research, patents, funding, techIntel, publications] = await Promise.all([
        dashboardService.getDashboard().catch(() => null),
        researchIntelligenceService.getDashboard().catch(() => null),
        patentAnalyticsService.getDashboard().catch(() => null),
        fundingService.getRecommendations(user?.id || 1).catch(() => []),
        patentAnalyticsService.getTechnologyIntelligence().catch(() => []),
        publicationService.getAllPublications().catch(() => [])
      ]);

      setDashboardData(dashboard);
      setResearchData(research);
      setPatentData(patents);
      setFundingData(funding.slice(0, 5)); // Show top 5 recommendations
      setTechnologyIntelligenceData(techIntel);
      setPublicationsData(publications.slice(0, 5)); // Show top 5 publications
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show profile setup prompt if user doesn't have a research profile
  if (dashboardData && !dashboardData.has_profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Welcome! To get the most out of the dashboard, please complete your research profile.
        </Alert>
        <Alert severity="warning">
          No research profile found. Some dashboard features may be limited until you set up your profile.
        </Alert>
      </Box>
    );
  }

  // Calculate stats from available data
  const innovationScore = patentData?.average_innovation_score || 0;
  const fundingMatches = researchData?.total_recommendations || 0;
  const publicationCount = publicationsData?.length || researchData?.publication_count || 0;
  const patentCount = patentData?.total_patents || 0;
  const commercialReady = patentData?.commercialization_ready || 0;
  
  // Get user info from dashboard data
  const userName = dashboardData?.user || user?.full_name || 'User';
  const userRole = dashboardData?.role || user?.role || 'Researcher';
  const userOrganization = dashboardData?.organization || user?.organization || 'Organization';

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        width: "100%",
        maxWidth: 1600,
        mx: "auto",
        gap: 3,
        mt: 0,
      }}
    >
      <DashboardHeader />

      {/* KPI Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Innovation Score"
            value={`${Math.round(innovationScore)}%`}
            subtitle="Average across patents"
            color="#7C3AED"
            icon={<ScienceIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Funding Matches"
            value={fundingMatches}
            subtitle="Recommended opportunities"
            color="#3B82F6"
            icon={<PaidIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Publications"
            value={publicationCount}
            subtitle="Total publications"
            color="#10B981"
            icon={<DescriptionIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Patents"
            value={patentCount}
            subtitle={`${commercialReady} Commercial Ready`}
            color="#F59E0B"
            icon={<GavelIcon />}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <PublicationTrendsChart data={researchData?.publication_trends || []} />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <PatentChart data={Object.entries(patentData?.technology_distribution || {}).map(([name, value]) => ({ name, value }))} />
        </Grid>
      </Grid>

      {/* AI + Timeline */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AIInsights insights={[
            ...(dashboardData?.insights || []),
            ...(technologyIntelligenceData?.map(item => 
              typeof item === 'string' ? item : item.insight || item.description || item.title || item.technology
            ).filter(item => item && typeof item === 'string' && item.trim().length > 0) || [])
          ]} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ActivityTimeline activities={dashboardData?.activities || []} />
        </Grid>
      </Grid>

      {/* Funding Table */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <FundingTable fundingData={fundingData} />
        </Grid>
      </Grid>

      {/* Publications */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={12}>
          <PublicationsTable publications={publicationsData || researchData?.publications || []} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;