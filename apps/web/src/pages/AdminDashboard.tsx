import { useState } from 'react';
import { Title, Card, Text, Group, Stack, Table, Pagination, Badge } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { AdminStats } from '@biophonics/shared';
import { Users, Activity, Target, CheckCircle2, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-logs', page],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs', { params: { page } });
      return res.data;
    },
  });

  return (
    <Stack gap="xl">
      <Title order={2}>Admin Dashboard</Title>

      {statsLoading ? (
        <Text>Loading stats...</Text>
      ) : (
        <Group grow align="flex-start">
          <Card shadow="sm" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Total Users</Text>
              <Users size={20} color="var(--mantine-color-blue-6)" />
            </Group>
            <Text size="xl" fw={700}>{stats?.totalUsers}</Text>
          </Card>

          <Card shadow="sm" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>New Users (7d)</Text>
              <TrendingUp size={20} color="var(--mantine-color-green-6)" />
            </Group>
            <Text size="xl" fw={700}>{stats?.newUsersLast7Days}</Text>
          </Card>

          <Card shadow="sm" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Total Projects</Text>
              <Target size={20} color="var(--mantine-color-indigo-6)" />
            </Group>
            <Text size="xl" fw={700}>{stats?.totalProjects}</Text>
          </Card>

          <Card shadow="sm" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Tasks Completed</Text>
              <CheckCircle2 size={20} color="var(--mantine-color-teal-6)" />
            </Group>
            <Text size="xl" fw={700}>{stats?.completedTasks} / {stats?.totalTasks}</Text>
          </Card>
        </Group>
      )}

      <Card shadow="sm" radius="md" withBorder mt="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <Activity size={20} />
            <Title order={4}>System Audit Logs</Title>
          </Group>
        </Group>

        {logsLoading ? (
          <Text>Loading logs...</Text>
        ) : (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Entity Type</Table.Th>
                  <Table.Th>Entity ID</Table.Th>
                  <Table.Th>IP Address</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs?.data.map((log: any) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>{new Date(log.createdAt).toLocaleString()}</Table.Td>
                    <Table.Td>{log.user ? `${log.user.fullName} (${log.user.email})` : 'System'}</Table.Td>
                    <Table.Td>
                      <Badge color={log.action === 'CREATE' ? 'green' : log.action === 'DELETE' ? 'red' : 'blue'}>
                        {log.action}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{log.entityType}</Table.Td>
                    <Table.Td><Text size="xs" c="dimmed" ff="monospace">{log.entityId}</Text></Table.Td>
                    <Table.Td>{log.ipAddress || 'Unknown'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {logs?.meta?.pages > 1 && (
              <Group justify="center" mt="md">
                <Pagination total={logs.meta.pages} value={page} onChange={setPage} />
              </Group>
            )}
          </>
        )}
      </Card>
    </Stack>
  );
}
