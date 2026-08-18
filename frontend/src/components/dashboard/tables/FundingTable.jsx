import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
} from "@mui/material";

function FundingTable({ fundingData = [] }) {
  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'N/A';
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
        border: "1px solid rgba(124, 58, 237, 0.1)",
        color: "white",
        borderRadius: 3,
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.15)",
          borderColor: "rgba(124, 58, 237, 0.3)"
        }
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={2}
          sx={{
            fontWeight: 600,
            background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Recent Funding Opportunities
        </Typography>

        {fundingData.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Agency
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Deadline
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Match
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {fundingData.slice(0, 5).map((funding) => (
                <TableRow
                  key={funding.id || funding.funding_id}
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      background: "rgba(124, 58, 237, 0.1)"
                    }
                  }}
                >
                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "rgba(255, 255, 255, 0.9)" }}>
                        {funding.agency}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {funding.research_area}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: "#10B981", fontWeight: 600 }}>
                    {formatAmount(funding.amount)}
                  </TableCell>

                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    {formatDeadline(funding.deadline)}
                  </TableCell>

                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {funding.match_score !== undefined ? (
                      <Chip
                        label={`${Math.round(funding.match_score)}%`}
                        size="small"
                        sx={{
                          minWidth: 50,
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
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No funding data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default FundingTable;