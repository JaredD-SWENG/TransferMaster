import { FC } from "react";
import { useSelector } from "../../../../store/Store";
import Link from "next/link";
import { styled } from "@mui/material";
import { AppState } from "../../../../store/Store";
import Image from "next/image";

const Logo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "40px" : "180px",
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/dashboards/navigator">
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/logos/logo.svg"
            alt="logo"
            height={customizer.TopbarHeight}
            width={80}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/logo.svg"}
            alt="logo"
            height={customizer.TopbarHeight}
            width={80}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {customizer.activeMode === "dark" ? (
        <Image
          src="/images/logos/logo.svg"
          alt="logo"
          height={customizer.TopbarHeight}
          width={80}
          priority
        />
      ) : (
        <Image
          src="/images/logos/logo.svg"
          alt="logo"
          height={customizer.TopbarHeight}
          width={80}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
