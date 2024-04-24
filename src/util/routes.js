import { CalendarFilled, CompassFilled, CompassOutlined, FundProjectionScreenOutlined, HomeOutlined, ManOutlined, SettingFilled, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import Login from "../pages/Login";
import Volunteer from "../pages/Volunteer";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Orgs from "../pages/Orgs.jsx";
import AdminTool from "../pages/AdminTool.jsx";
import Event from "../pages/Events.jsx";
import Calendar from "../pages/Calendar.jsx";
import Profile from "../pages/Profile.jsx";

export default [
    {
        name:'Dashboard',
        path:'/',
        Component:Dashboard,
        Icon: HomeOutlined,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN','GENERAL']
    },
    {
        name:'Volunteer',
        path:'/volunteer',
        Component:Volunteer,
        Icon: UserOutlined,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN']
    },
    {
        name:'Projects',
        path:'/projects',
        Component:Projects,
        Icon: FundProjectionScreenOutlined,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN']
    },
    {
        name:'Events',
        path:'/events',
        Component: Event,
        Icon: CompassFilled,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN']
    },
    {
        name:'Calendar',
        path:'/calendar',
        Component: Calendar,
        Icon: CalendarFilled,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN','GENERAL']
    },
    {
        name:'Organizational Units',
        path:'/ous',
        Component: Orgs,
        Icon: CompassOutlined,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN']
    },
    {
        name:'Admin Tools',
        path:'/admin-tool',
        Component: AdminTool,
        Icon: SolutionOutlined,
        allowed: ['SUPER_ADMIN']
    },
    {
        name:'Settings',
        path:'/settings',
        Component: Profile,
        Icon: SettingFilled,
        allowed:['SUPER_ADMIN','ORG_ADMIN','PROJECT_ADMIN','GENERAL']
    }

]