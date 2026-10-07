import { Container, Title, Text, Button, Group, Stack, Badge, ThemeIcon, SimpleGrid, Card } from '@mantine/core';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Rocket, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: <Rocket size={24} />,
    title: 'Extreme Performance',
    description: 'Built with React and Vite, experience lightning fast transitions and smooth animations across the entire platform.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Dynamic Task Management',
    description: 'Keep your team aligned with real-time project tracking, priority boards, and deadline alerts.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Enterprise Security',
    description: 'State-of-the-art JWT authentication, strict rate limiting, and comprehensive system audit logs.',
  },
];

export function Landing() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Navbar Simulation */}
      <Container size="lg" h={80}>
        <Group justify="space-between" h="100%">
          <Group>
            <ThemeIcon size="lg" color="terracotta" radius="md">
              <LayoutDashboard size={20} />
            </ThemeIcon>
            <Title order={3}>ProjectFlow</Title>
          </Group>
          <Group>
            <Button component={Link} to="/login" variant="subtle" color="terracotta">
              Sign In
            </Button>
            <Button component={Link} to="/login" color="terracotta">
              Get Started
            </Button>
          </Group>
        </Group>
      </Container>

      {/* Hero Section */}
      <Container size="lg" py={80}>
        <Stack align="center" gap="lg" ta="center">
          <Badge variant="light" color="terracotta" size="lg" radius="xl">
            Introducing ProjectFlow v1.0
          </Badge>
          <Title
            style={{ fontSize: '4rem', lineHeight: 1.1 }}
            fw={300}
          >
            Manage your projects with<br />
            <span style={{ 
              color: 'var(--mantine-color-terracotta-filled)'
            }}>
              Unmatched Clarity
            </span>
          </Title>
          <Text c="dimmed" size="xl" maw={600} mx="auto" mt="md">
            The ultimate productivity suite for modern teams. Streamline workflows, track progress, and achieve your goals faster than ever before.
          </Text>
          <Group mt="xl" gap="md">
            <Button component={Link} to="/login" size="xl" color="terracotta" radius="md">
              Start Building Free
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Features Section */}
      <Container size="lg" py={80}>
        <Title order={2} ta="center" mb={50}>
          Everything you need to scale
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
          {features.map((feature, index) => (
            <Card key={index} shadow="md" radius="md" padding="xl" withBorder style={{ transition: 'transform 0.2s ease' }} className="hover-card">
              <ThemeIcon size={50} radius="md" variant="light" color="terracotta" mb="md">
                {feature.icon}
              </ThemeIcon>
              <Text fw={700} size="lg" mb="sm">
                {feature.title}
              </Text>
              <Text c="dimmed" size="sm">
                {feature.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
      
      {/* Footer */}
      <div style={{ backgroundColor: '#FCF6F0', borderTop: '1px solid rgba(0,0,0,0.12)', padding: '40px 0', marginTop: '80px' }}>
        <Container size="lg">
          <Group justify="space-between">
            <Group>
              <ThemeIcon size="sm" color="terracotta">
                <LayoutDashboard size={14} />
              </ThemeIcon>
              <Text fw={600}>ProjectFlow</Text>
            </Group>
            <Text c="dimmed" size="sm">© 2026 ProjectFlow Inc. All rights reserved.</Text>
          </Group>
        </Container>
      </div>
    </div>
  );
}
