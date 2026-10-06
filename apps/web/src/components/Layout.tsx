import { AppShell, Burger, Group, Title, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../api';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.clear();
      navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    if (isError) handleUnauthorized();
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [isError, navigate, queryClient]);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    queryClient.clear();
    navigate('/login');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} c="indigo">ProjectFlow</Title>
          </Group>
          <Group>
            <Text size="sm" fw={500}>{user?.fullName}</Text>
            <Button variant="light" size="xs" color="gray" onClick={handleLogout} leftSection={<LogOut size={16} />}>
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Button component={Link} to="/dashboard" variant="subtle" justify="flex-start" fullWidth leftSection={<LayoutDashboard size={20} />} mb="sm">
          Dashboard
        </Button>
        <Button component={Link} to="/projects" variant="subtle" justify="flex-start" fullWidth leftSection={<FolderKanban size={20} />} mb="sm">
          Projects
        </Button>
        <Button component={Link} to="/tasks" variant="subtle" justify="flex-start" fullWidth leftSection={<CheckSquare size={20} />} mb="sm">
          Tasks
        </Button>
        {user?.role === 'ADMIN' && (
          <Button component={Link} to="/admin" variant="subtle" justify="flex-start" fullWidth leftSection={<Settings size={20} />} mt="auto">
            Admin Panel
          </Button>
        )}
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
