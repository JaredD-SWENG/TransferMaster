import { NextPage } from 'next';

type CustomNextPage<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: JSX.Element) => JSX.Element
};

export default CustomNextPage;