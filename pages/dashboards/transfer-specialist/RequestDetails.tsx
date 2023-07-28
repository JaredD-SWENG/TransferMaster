import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DocumentReference, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase'; // Replace with the actual path to your Firebase configuration

interface SyllabusDoc {
  InstitutionName: string;
  CourseName: string;
  Credits: number;
  CourseCategory: string;
  TermType: string;
  SyllabusURL: DocumentReference;
  Textbook: string;
}

interface UserDoc {
  Name: string;
  Department: string;
  Email: string;
  Role: string;

}

const RequestDetails = () => {
  const router = useRouter();
  const [comments, setComments] = useState('');
  const [date, setDate] = useState('');
  const [requester, setRequester] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [status, setStatus] = useState('');
  const [extCourseName, setExtCourseName] = useState('');
  const [extCourseCategory, setExtCourseCategory] = useState('');
  const [extInstitution, setExtInstitutionName] = useState('');
  const [extCredits, setExtCredits] = useState(0);
  const [extTextbook, setExtTextbook] = useState('');
  const [extTermType, setExtTermType] = useState('');
  const [psuCourseName, setPSUCourseName] = useState('');
  const [psuCourseCategory, setPSUCourseCategory] = useState('');
  const [psuInstitution, setPSUInstitutionName] = useState('');
  const [psuCredits, setPSUCredits] = useState(0);
  const [psuTextbook, setPSUTextbook] = useState('');
  const [psuTermType, setPSUTermType] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      const { requestID } = router.query;
      console.log('requestID', requestID);

      // Check if the requestID exists
      if (requestID) {
        try {
          // Fetch the request document from Firestore
          const requestDocRef = doc(db, 'Requests', requestID as string);
          const requestDocSnapshot = await getDoc(requestDocRef);

          // Check if the request document exists and has a "comments" field
          if (requestDocSnapshot.exists()) {
            const commentsData = requestDocSnapshot.data().Comments;
            const timestamp = requestDocSnapshot.data().Date as unknown as Timestamp;
            const formattedDate = timestamp.toDate().toLocaleDateString();
            const status = requestDocSnapshot.data().Status;

            const requesterRef = requestDocSnapshot.data().Requester;
            console.log(requesterRef);
            if (requesterRef) {
              const requesterDoc = await getDoc(requesterRef);
              if (requesterDoc.exists()) {
                const requesterData = requesterDoc.data() as UserDoc;
                const requesterName = requesterData?.Name;
                setRequester(requesterName);
              }
            }

            const reviewerRef = requestDocSnapshot.data().Reviewer;
            console.log(reviewerRef);
            if (reviewerRef) {
              const reviewerDoc = await getDoc(reviewerRef);
              if (reviewerDoc.exists()) {
                const reviewerData = reviewerDoc.data() as UserDoc;
                const reviewerName = reviewerData?.Name;
                setReviewer(reviewerName);
              }else{
                setReviewer("Not yet assigned")
              }
            }else{
              setReviewer("Not yet assigned")
              
            }

            const psuSyllabusRef = requestDocSnapshot.data().PSUSyllabus;
           
            if (psuSyllabusRef) {
              const psuSyllabusDoc = await getDoc(psuSyllabusRef);
              if (psuSyllabusDoc.exists()) {
                // Access the data from the "PSUSyllabus" document
                const psuSyllabusData = psuSyllabusDoc.data() as SyllabusDoc;
                setPSUCourseName(psuSyllabusData.CourseName);
                setPSUCourseCategory(psuSyllabusData.CourseCategory);
                setPSUCredits(psuSyllabusData.Credits);
                setPSUTextbook(psuSyllabusData.Textbook);
                setPSUInstitutionName(psuSyllabusData.InstitutionName);
                setPSUTermType(psuSyllabusData.TermType);
              }
            }

            const extSyllabusRef = requestDocSnapshot.data().ExternalSyllabus;
            console.log("extsyllabusref ", extSyllabusRef);
            if (extSyllabusRef) {
              const extSyllabusDoc = await getDoc(extSyllabusRef);
              if (extSyllabusDoc.exists()) {
                // Access the data from the "ExtSyllabus" document
                const extSyllabusData = extSyllabusDoc.data() as SyllabusDoc;
                setExtCourseName(extSyllabusData.CourseName);
                setExtCourseCategory(extSyllabusData.CourseCategory);
                setExtCredits(extSyllabusData.Credits);
                setExtTextbook(extSyllabusData.Textbook);
                setExtInstitutionName(extSyllabusData.InstitutionName);
                setExtTermType(extSyllabusData.TermType);
              }
            }

            setComments(commentsData);
            setDate(formattedDate);
            setStatus(status);
          } else {
            console.log('Request document not found.');
          }
        } catch (error) {
          console.error('Error fetching request details:', error);
        }
      }
    };
    fetchDetails();
  }, [router.query]);

  return (
    <div>
      <h1>Request Details</h1>
  
      <div>
        <p>
          <b>Date:</b> {date}
        </p>
        <p>
          <b>Requester:</b> {requester}
        </p>
        <p>
          <b>Reviewer:</b> {reviewer}
        </p>
        <p>
          <b>Status:</b> {status}
        </p>
      </div>
  
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <h2>Penn State Course:</h2>
          <p>
            <b>Institution Name:</b> {psuInstitution}
          </p>
          <p>
            <b>Course Name:</b> {psuCourseName}
          </p>
          <p>
            <b>Course Category:</b> {psuCourseCategory}
          </p>
          <p>
            <b>Credits:</b> {psuCredits}
          </p>
          <p>
            <b>Textbook:</b> {psuTextbook}
          </p>
          <p>
            <b>Term Type:</b> {psuTermType}
          </p>
        </div>
  
        <div style={{ flex: 1 }}>
          <h2>External Course:</h2>
          <p>
            <b>Institution Name:</b> {extInstitution}
          </p>
          <p>
            <b>Course Name:</b> {extCourseName}
          </p>
          <p>
            <b>Course Category:</b> {extCourseCategory}
          </p>
          <p>
            <b>Credits:</b> {extCredits}
          </p>
          <p>
            <b>Textbook:</b> {extTextbook}
          </p>
          <p>
            <b>Term Type:</b> {extTermType}
          </p>
        </div>
      </div>
  
      <p>
        <b>Comments:</b> {comments}
      </p>
    </div>
  );
  
  
};

export default RequestDetails;
