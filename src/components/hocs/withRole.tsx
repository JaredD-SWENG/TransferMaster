import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, Firestore, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase'; // or wherever you exported the auth and db from
import CustomNextPage from '../../../types/custom';

interface WithRoleProps {
  roles: string[];
  Component: CustomNextPage<any>;
}

const withRole = ({ roles, Component }: WithRoleProps) => {
  const ProtectedRoute: CustomNextPage<any> = ({...args}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const getUserRole = async (email: string): Promise<string | null> => {
      const q = query(collection(db, 'Users'), where('Email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData: DocumentData | undefined = querySnapshot.docs[0].data();
        return userData?.Role; // assuming the role field is named 'role'
      } else {
        return null;
      }
    }

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            console.log(roles)
            if (user && user.email) {
                const userRole = await getUserRole(user.email);
                console.log(userRole)
                if(userRole) {
                    if(!roles.includes(userRole)) {
                        router.push('../403')
                    }
                    setUser(user);
                }
            } else {
                router.push('../auth/auth1/login');
            }
        setLoading(false);
      });
    }, []);

    if (loading) {
      return null; // or display a loading spinner
    } else {
      return <Component {...args} />
    }
  }

  // If getLayout was set in the original component, we preserve it
  if (Component.getLayout) {
    ProtectedRoute.getLayout = Component.getLayout;
  }

  return ProtectedRoute;
}

export default withRole;
