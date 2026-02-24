import React, { useState, useEffect, useRef } from 'react';
import './RoleTransition.css';

const transitions = {
    CUSTOMER: {
        title: '동네마켓',
        subtitle: '오늘도 즐거운 쇼핑 되세요!',
        icon: '🛒',
        bgColor: '#20da83ff', // sky-400
    },
    STORE: {
        title: '사장님 모드',
        subtitle: '오늘도 대박 나세요!',
        icon: '🏪',
        bgColor: '#c026d3', // fuchsia-600
    },
    RIDER: {
        title: '라이더 모드',
        subtitle: '안전 운전하세요!',
        icon: '🛵',
        bgColor: '#2e92f0ff', // emerald-500
    },
    ADMIN: {
        title: '관리자 모드',
        subtitle: '시스템을 관리합니다.',
        icon: '👨🏻‍💻',
        bgColor: '#0f172a', // slate-900
    }
};

export const AccessDeniedAnimation = ({ role, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const roleNameMap = {
        STORE: '사장님',
        RIDER: '라이더',
        ADMIN: '관리자'
    };
    const roleName = roleNameMap[role] || role;

    return (
        <div className="role-transition-overlay denied">
            <div className="role-transition-content denied">
                <div className="role-transition-icon denied">🔒</div>
                <h1 className="role-transition-title" style={{ color: '#fff' }}>접근 거부</h1>
                <p className="role-transition-subtitle" style={{ color: '#fca5a5', marginTop: '16px', fontSize: '20px' }}>
                    죄송합니다.<br />
                    <strong style={{ color: '#fff', fontSize: '24px' }}>{roleName}</strong> 권한이 없습니다!
                </p>
            </div>
        </div>
    );
};

const RoleTransition = ({ userRole, children }) => {
    const [displayRole, setDisplayRole] = useState(userRole);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animatingRole, setAnimatingRole] = useState(userRole);
    const prevRoleRef = useRef(userRole);

    useEffect(() => {
        if (userRole !== prevRoleRef.current) {
            setAnimatingRole(userRole);
            setIsAnimating(true);

            const swapTimer = setTimeout(() => {
                setDisplayRole(userRole);
            }, 1000);

            const endTimer = setTimeout(() => {
                setIsAnimating(false);
            }, 2000);

            prevRoleRef.current = userRole;

            return () => {
                clearTimeout(swapTimer);
                clearTimeout(endTimer);
            };
        }
    }, [userRole]);

    const config = transitions[animatingRole] || transitions.CUSTOMER;

    return (
        <>
            {children(displayRole)}

            {isAnimating && (
                <div className="role-transition-overlay" style={{ backgroundColor: config.bgColor }}>
                    <div className="role-transition-content">
                        <div className="role-transition-icon">{config.icon}</div>
                        <h1 className="role-transition-title">{config.title}</h1>
                        <p className="role-transition-subtitle">{config.subtitle}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleTransition;
