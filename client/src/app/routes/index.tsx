import {createBrowserRouter, Navigate} from "react-router-dom";
import {LoginPage} from "../../features/pages/login-page";
import {CatalogPage} from "../../features/pages/catalog-page";
import {MainLayout} from "../../features/pages/main-layout";
import {ProtectedRoute} from '../../features/protected-route';
import {NotFoundPage} from "../../features/pages/not-found-page";
import {ModLoadPage} from "../../features/pages/mod-load-page";
import {ProfilePage} from "../../features/pages/profile-page";

export const routes = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/mods" replace/>
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        path: 'mods',
                        element: <CatalogPage/>
                    },
                    {
                        path: 'load',
                        element: <ModLoadPage/>
                    },
                    {
                        path: 'profile',
                        element: <ProfilePage/>
                    }
                ]
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage/>
    }
])