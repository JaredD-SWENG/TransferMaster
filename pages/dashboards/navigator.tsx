import { getAuth } from 'firebase/auth';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { auth, db } from "../../config/firebase";

const PushDashboard = () => {
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            let userRole = null;

            if (user) {
                const email = user.email;
                const q = query(collection(db, "Users"), where("Email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    userRole = userData.Role;
                }
            }

            if (userRole) {
                switch(userRole) {
                    case 'Student':
                        router.push("/dashboards/student");
                        break;
                    case 'Transfer Specialist':
                        router.push("/dashboards/transfer-specialist");
                        break;
                    default:
                        router.push("/dashboards/faculty");
                        break;
                }
            } else {
                console.log("No user role.")
                router.push("../landingpage/");
            }
        };
        
        fetchData();
    }, []);

    return null; // This component doesn't render anything
};

export default PushDashboard;