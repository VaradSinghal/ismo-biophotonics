import { AppShell, Burger, Group, Title, Button, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../api';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
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
            <Title order={3} c="terracotta">ProjectFlow</Title>
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
        <NavLink component={Link} to="/dashboard" label="Dashboard" leftSection={<LayoutDashboard size={20} />} active={location.pathname === '/dashboard'} variant="filled" color="terracotta" style={{ borderRadius: 8, marginBottom: 8 }} />
        <NavLink component={Link} to="/projects" label="Projects" leftSection={<FolderKanban size={20} />} active={location.pathname === '/projects'} variant="filled" color="terracotta" style={{ borderRadius: 8, marginBottom: 8 }} />
        <NavLink component={Link} to="/tasks" label="Tasks" leftSection={<CheckSquare size={20} />} active={location.pathname === '/tasks'} variant="filled" color="terracotta" style={{ borderRadius: 8, marginBottom: 8 }} />
        {user?.role === 'ADMIN' && (
          <NavLink component={Link} to="/admin" label="Admin Panel" leftSection={<Settings size={20} />} active={location.pathname === '/admin'} variant="filled" color="terracotta" style={{ borderRadius: 8, marginTop: 'auto' }} />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
