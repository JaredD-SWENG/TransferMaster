import { ReactElement } from "react";
import CustomNextPage from "../../types/custom";
import SyllabusComparison from "./SyllabusComparison";
import FullLayout from "../../src/layouts/full/FullLayout";
import withRole from "../../src/components/hocs/withRole";

const Comparison: CustomNextPage = () => {
  return (
    <SyllabusComparison
      course="MATH 141"
      credits={4}
      textbook="Calculus 2 by Manasi Patil"
      learningObjectives={[
        "Want to sell your soul",
        "Learn calculus 2",
        "Cry many tears",
        "Fill out pieces of paper worth a small forest with problem questions or use up all your storage space",
      ]}
    />
  );
};

Comparison.getLayout = function getLayout(page: ReactElement) {
  return <FullLayout>{page}</FullLayout>;
};

export default withRole({
  Component: Comparison,
  roles: ["Faculty", "Transfer Specialist"],
});
