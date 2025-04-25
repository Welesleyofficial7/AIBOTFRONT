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

const { Title, Text } = Typography;

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        setLoading(true);
        setError('');

        // Заглушка для авторизации/регистрации
        setTimeout(() => {
            setLoading(false);
            console.log('Auth data:', values);

            // В реальном приложении здесь будет вызов API
            if (values.email === 'demo@example.com' && values.password === 'demo123') {
                navigate('/'); // Перенаправляем на главную после успешной авторизации
            } else {
                setError('Неверные учетные данные. Попробуйте demo@example.com / demo123');
            }
        }, 1000);
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
                        rules={[{ required: true, message: 'Пожалуйста, введите email!' }]}
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