import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase'; // Replace with the actual path to your Firebase configuration

const RequestDetails = () => {
  const router = useRouter();
  const [comments, setComments] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const { requestID } = router.query;
      console.log("requestID", requestID)

      // Check if the requestID exists
      if (requestID) {
        try {
            
          // Fetch the request document from Firestore
          const requestDocRef = doc(db, 'Requests', requestID as string);
          const requestDocSnapshot = await getDoc(requestDocRef);
          
          // Check if the request document exists and has a "comments" field
          if (requestDocSnapshot.exists() && requestDocSnapshot.data().Comments) {
            const commentsData = requestDocSnapshot.data().Comments;
            setComments(commentsData);
            
          }else{
            setComments("Not provided")
          }
        } catch (error) {
          console.error('Error fetching request details:', error);
        }
      }
    };

    fetchComments();
  }, [router.query]);

  return (
    <div>
      <h1>Request Details</h1>
      <p><b>Comments</b>: {comments}</p>
    </div>
  );
};

export default RequestDetails;
