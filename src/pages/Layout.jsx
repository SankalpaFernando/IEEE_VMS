import { BrowserRouter, Route, Routes } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import routes from "../util/routes"
import Project from "./Project"
import Org from "./Org"
import { AuthRoute } from "../App"

export default ()=>{
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1  bg-gray-100">
                
                    <Routes>
                        {
                            routes.map(({path,Component,allowed},index)=>(<Route key={index} path={`dashboard${path}`} element={<AuthRoute allowed={allowed} element={<Component/>} />} />))
                        }
                        <Route path="dashboard/projects/:projectID" element={<Project/>} />
                        <Route path="dashboard/ous/:ouID" element={<Org/>} />
                    </Routes>
           
            </div>
        </div>
    )
}