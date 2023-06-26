import SyllabusComparison from "./SyllabusComparison"

const Comparison = () => {
    return (
        <SyllabusComparison 
            course="MATH 141" 
            credits={4} 
            textbook="Calculus 2 by Manasi Patil" 
            learningObjectives={["Want to sell your soul", "Learn calculus 2", "Cry many tears", "Fill out pieces of paper worth a small forest with problem questions or use up all your storage space"]}
        />
    );
};

export default Comparison;