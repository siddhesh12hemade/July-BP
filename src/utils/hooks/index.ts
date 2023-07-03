import _ from "lodash";
import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation as useTranslations } from "react-i18next";

const getDeviceConfig = (width: number) => {
  if (width < 576) {
    return "xs";
  } else if (width >= 576 && width < 768) {
    return "sm";
  } else if (width >= 768 && width < 992) {
    return "md";
  } else if (width >= 992 && width < 1200) {
    return "lg";
  } else if (width >= 1200 && width < 1400) {
    return "xl";
  } else if (width >= 1400 && width < 1920) {
    return "xxl";
  } else if (width >= 1920) {
    return "xxxl";
  }
};

export const useBreakpoint = () => {
  const [brkPnt, setBrkPnt] = useState(() =>
    getDeviceConfig(window.innerWidth)
  );

  useEffect(() => {
    const calcInnerWidth = _.throttle(function () {
      setBrkPnt(getDeviceConfig(window.innerWidth));
    }, 200);
    window.addEventListener("resize", calcInnerWidth);
    return () => window.removeEventListener("resize", calcInnerWidth);
  }, []);

  return brkPnt;
};

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

export const useTranslation = () => {
  const { t: translation } = useTranslations();

  function t(key: string) {
    return translation(`${key}`);
  }

  return { t };
};
