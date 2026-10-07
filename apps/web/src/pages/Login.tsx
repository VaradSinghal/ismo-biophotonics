import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack, Group, Anchor, Box, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { loginSchema, registerSchema } from '@biophonics/shared';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      fullName: '',
    },
    validate: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const onSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      let response;
      if (isRegister) {
        response = await api.post('/auth/register', values);
      } else {
        response = await api.post('/auth/login', { email: values.email, password: values.password });
      }
      import('../api').then(({ setAccessToken }) => setAccessToken(response.data.data.accessToken));
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/dashboard');
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3EDDF' }}>
      <Box style={{ flex: 1, backgroundColor: 'var(--mantine-color-terracotta-filled)', color: 'white', position: 'relative', overflow: 'hidden' }} visibleFrom="sm">
        <Center h="100%">
          <Stack align="center" gap="xl">
            <LayoutDashboard size={100} color="white" />
            <Title style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem' }}>ProjectFlow</Title>
            <Text size="lg" maw={400} ta="center">The most elegant way to manage projects, tasks, and team productivity.</Text>
          </Stack>
        </Center>
      </Box>

      <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Paper withBorder shadow="xl" p={40} radius="lg" w="100%" maw={450} style={{ backgroundColor: '#FCF6F0' }}>
          <Title ta="center" mb="md" style={{ fontFamily: 'Fraunces' }}>
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </Title>
          <Text c="dimmed" size="sm" ta="center" mb="xl">
            {isRegister ? 'Enter your details to get started' : 'Sign in to access your dashboard'}
          </Text>

          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
              {isRegister && (
                <TextInput label="Full Name" placeholder="John Doe" required {...form.getInputProps('fullName')} />
              )}
              <TextInput label="Email Address" placeholder="you@example.com" required {...form.getInputProps('email')} />
              <PasswordInput label="Password" placeholder="Your password" required {...form.getInputProps('password')} />
              <Button type="submit" fullWidth mt="md" loading={loading} size="lg">
                {isRegister ? 'Sign up' : 'Sign in'}
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt="xl">
            <Text size="sm" c="dimmed">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Anchor component="button" type="button" onClick={() => { setIsRegister(!isRegister); form.reset(); }} size="sm" fw={600} color="terracotta">
              {isRegister ? 'Sign in' : 'Create account'}
            </Anchor>
          </Group>
        </Paper>
      </Box>
    </div>
  );
}
