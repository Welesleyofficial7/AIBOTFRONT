import React, { useState } from 'react';
import {
    LockOutlined,
    UserOutlined,
    MailOutlined
} from '@ant-design/icons';
import {
    Button,
    Form,
    Input,
    Card,
    Divider,
    Typography,
    Alert
} from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';
import logo from '../../assets/logo.svg';
import { getUserByEmail, login, register } from '../../services/AuthService';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setAuthenticated, setAccessToken, setRefreshToken } = useAuth();

    const onFinish = (values: any) => {
        setLoading(true);
        setError('');

        if (isLogin) {
            login({ username: values.email, password: values.password })
                .then(async (response) => {
                    localStorage.setItem('accessToken', response.access_token);
                    localStorage.setItem('refreshToken', response.refresh_token);
                    setAuthenticated(true);
                    setAccessToken(response.access_token);
                    setRefreshToken(response.refresh_token);

                    try {
                        const userData = await getUserByEmail(values.email);
                        localStorage.setItem('userId', String(userData.userId));
                    } catch (err) {
                        console.error("Ошибка получения ID пользователя", err);
                    }

                    setLoading(false);
                    navigate('/');
                })
                .catch((error) => {
                    setLoading(false);
                    setError('Неверные учетные данные');
                });
        } else {
            if (values.password !== values.confirm) {
                setLoading(false);
                setError('Пароли не совпадают');
                return;
            }

            register({ email: values.email, password: values.password })
                .then(async () => {
                    setIsLogin(true);
                    setError('Регистрация успешна. Войдите в систему.');

                    const loginResponse = await login({
                        username: values.email,
                        password: values.password,
                    });

                    localStorage.setItem('accessToken', loginResponse.access_token);
                    localStorage.setItem('refreshToken', loginResponse.refresh_token);

                    const userData = await getUserByEmail(values.email);
                    localStorage.setItem('userId', String(userData.userId));

                    navigate('/');
                })
                .catch((error) => {
                    setError('Ошибка при регистрации');
                    setLoading(false);
                });
        }
    };

    return (
        <div className={styles.authContainer}>
            <Card className={styles.authCard}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                    <Title level={3} className={styles.title}>
                        {isLogin ? 'Вход в систему' : 'Регистрация'}
                    </Title>
                </div>

                {error && <Alert message={error} type="error" showIcon className={styles.alert} />}

                <Form
                    name="auth"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите email!' },
                            {
                                type: 'email',
                                message: 'Некорректный формат email!',
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Пароль"
                            size="large"
                        />
                    </Form.Item>

                    {!isLogin && (
                        <Form.Item
                            name="confirm"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Пожалуйста, подтвердите пароль!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Пароли не совпадают!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Подтвердите пароль"
                                size="large"
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                        >
                            {isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </Form.Item>
                </Form>

                <Divider plain>
                    <Text type="secondary">
                        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    </Text>
                </Divider>

                <Button
                    type="link"
                    block
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Создать новый аккаунт' : 'Войти в существующий'}
                </Button>
            </Card>
        </div>
    );
};

export default AuthPage;