import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="p-6">
            <h1 className="text-2xl">Welcome, {user?.lastname}</h1>
        </div>
    );
};

export default Dashboard;
