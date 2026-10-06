import { Title, SimpleGrid, Card, Text, Group, RingProgress, Center, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { FolderKanban, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import type { DashboardStats } from '@biophonics/shared';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) return <Text>Loading dashboard...</Text>;
  if (!stats) return <Text c="red">Failed to load dashboard data</Text>;

  const progress = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <Stack gap="xl">
      <Title order={2}>Welcome back!</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Card shadow="sm" radius="md" withBorder>
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Total Projects</Text>
            <FolderKanban size={20} color="var(--mantine-color-indigo-6)" />
          </Group>
          <Text size="xl" fw={700}>{stats.totalProjects}</Text>
          <Text size="sm" c="dimmed">
            {stats.projectsInProgress} in progress
          </Text>
        </Card>

        <Card shadow="sm" radius="md" withBorder>
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Total Tasks</Text>
            <CheckSquare size={20} color="var(--mantine-color-teal-6)" />
          </Group>
          <Text size="xl" fw={700}>{stats.totalTasks}</Text>
          <Text size="sm" c="dimmed">
            {stats.completedTasks} completed
          </Text>
        </Card>

        <Card shadow="sm" radius="md" withBorder>
          <Group justify="space-between" mt="md" mb="xs">
            <Text fw={500}>Overdue Tasks</Text>
            <AlertCircle size={20} color="var(--mantine-color-red-6)" />
          </Group>
          <Text size="xl" fw={700} c={stats.overdueTasks > 0 ? 'red' : 'dark'}>
            {stats.overdueTasks}
          </Text>
        </Card>

        <Card shadow="sm" radius="md" withBorder>
          <Center h="100%">
            <RingProgress
              size={120}
              thickness={12}
              roundCaps
              sections={[{ value: progress, color: 'indigo' }]}
              label={
                <Text ta="center" fw={700} size="lg">
                  {Math.round(progress)}%
                </Text>
              }
            />
          </Center>
        </Card>
      </SimpleGrid>

      <Title order={3} mt="xl">Due Soon</Title>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {stats.dueSoonTasks.length === 0 ? (
          <Text c="dimmed">No tasks due in the next 3 days. You're all caught up!</Text>
        ) : (
          stats.dueSoonTasks.map((task) => (
            <Card key={task.id} shadow="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{task.name}</Text>
                <Group gap={5} c="dimmed">
                  <Clock size={16} />
                  <Text size="sm">{task.dueDate?.split('T')[0]}</Text>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={2}>
                {task.description || 'No description provided.'}
              </Text>
            </Card>
          ))
        )}
      </SimpleGrid>
    </Stack>
  );
}
