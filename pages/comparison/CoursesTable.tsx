import React from 'react';

interface CoursesTableProps {
  courses: string[];
}

const CoursesTable: React.FC<CoursesTableProps> = ({ courses }) => {
  return (
    <div className="courses-table">
      <h2>Found Courses</h2>
      <table>
        <thead>
          <tr>
            <th>Course Name</th>
            {/* Add more table headers if needed */}
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td>{course}</td>
              {/* Render other course data in the same row if needed */}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .courses-table {
          margin-top: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 10px;
          border: 1px solid #ccc;
          text-align: left;
        }

        th {
          background-color: #f2f2f2;
        }
      `}</style>
    </div>
  );
};

export default CoursesTable;
