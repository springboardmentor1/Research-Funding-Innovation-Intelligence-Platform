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

function PublicationsTable({ publications = [] }) {
  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
        border: "1px solid rgba(124, 58, 237, 0.1)",
        color: "white",
        borderRadius: 3,
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
          Recent Publications
        </Typography>

        {publications.length > 0 ? (
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
                  Title
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Author
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Year
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Citations
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "2px solid rgba(124, 58, 237, 0.3)"
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {publications.slice(0, 5).map((pub, index) => (
                <TableRow
                  key={index}
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      background: "rgba(124, 58, 237, 0.1)"
                    }
                  }}
                >
                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 500 }}>
                    {pub.title}
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    {pub.author}
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    {pub.year}
                  </TableCell>
                  <TableCell sx={{ color: "#3B82F6", fontWeight: 600 }}>
                    {pub.citations}
                  </TableCell>
                  <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    <Chip
                      label={pub.status}
                      size="small"
                      sx={{
                        background: pub.status === 'Published'
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                        border: pub.status === 'Published'
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid rgba(245, 158, 11, 0.3)',
                        color: pub.status === 'Published'
                          ? '#34D399'
                          : '#FBBF24',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No publications data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PublicationsTable;