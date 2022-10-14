import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { WalletProfileQuery, ProfileOffersQuery } from './../../../queries/profile.graphql';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Wallet } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Activity, ActivityType } from '../../../components/Activity';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { InView } from 'react-intersection-observer';
import ProfileLayout from '../../../layouts/ProfileLayout';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Select from '../../../components/Select';
import { useWallet } from '@solana/wallet-adapter-react';
import Button, { ButtonSize, ButtonType } from '../../../components/Button';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const {
    data: { wallet },
  } = await client.query({
    query: WalletProfileQuery,
    variables: {
      address: params?.address,
    },
  });

  if (wallet === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      ...i18n,
    },
  };
}

interface ProfileOffersData {
  wallet: Wallet;
}

interface ProfileOffersVariables {
  offset: number;
  limit: number;
  address: string;
  offerType: string | null;

}

enum OffersFilter {
  All = 'ALL',
  Received = 'OFFER_RECEIVED',
  Placed = 'OFFER_PLACED',
}

interface ProfileOffersForm {
  type: { value: OffersFilter; label: string };
}

export default function ProfileOffers(): JSX.Element {
  const { t } = useTranslation(['common', 'profile']);
  const { publicKey } = useWallet();
  console.log(publicKey);

  const activityFilterOptions = [
    { label: t('profile:offersFilter.allOffers'), value: OffersFilter.All },
    { label: t('profile:offersFilter.offersReceived'), value: OffersFilter.Received },
    { label: t('profile:offersFilter.offersPlaced'), value: OffersFilter.Placed },
  ];

  const { watch, control } = useForm<ProfileOffersForm>({
    defaultValues: {
      type: activityFilterOptions[0],
    },
  });
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const offersQuery = useQuery<ProfileOffersData, ProfileOffersVariables>(
    ProfileOffersQuery,
    {
      variables: {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        offerType: null,
      },
    }
  );
  console.log(offersQuery.data)

  useEffect(() => {
    const subscription = watch(({ type }) => {
      let variables: ProfileOffersVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        offerType: type?.value ?? null,
      };

      offersQuery.refetch(variables).then(({ data: { wallet } }) => {
        setHasMore(wallet.offers.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, offersQuery]);

  return (
    <>
      <Toolbar>
        <div className="hidden md:block" />
        <div className="col-span-2 md:col-span-1">
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select value={value} onChange={onChange} options={activityFilterOptions} />
            )}
          />
        </div>
      </Toolbar>
      <div className="mt-4 flex flex-col px-4 md:px-8">
        {offersQuery.loading ? (
          <>
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        ) : (
          <>
            {offersQuery.data?.wallet.offers.map((offer) => (
              <Activity
                avatar={
                  <Link href={`/nfts/${offer.nft?.mintAddress}/details`} passHref>
                    <a className="cursor-pointer transition hover:scale-[1.02]">
                      <Avatar src={offer.nft?.image as string} size={AvatarSize.Standard} />
                    </a>
                  </Link>
                }
                type={ActivityType.Offer}
                key={offer.id}
                meta={
                  <Activity.Meta title={<Activity.Tag />} marketplace={offer.nftMarketplace} />
                }
                actionButton={
                  offer.buyer === publicKey ? 
                  <Button type={ButtonType.Secondary} size={ButtonSize.Small} onClick={() => {}}> {t("profile:accept")} </Button>
                   : 
                  <Button type={ButtonType.Secondary}  size={ButtonSize.Small}  onClick={() => {}}> {t("profile:update")} </Button>
                  
                }
              >
                <Activity.Price amount={offer.solPrice} />
                <Activity.Timestamp timeSince={offer.timeSince} />
              </Activity>
            ))}
            {hasMore && (
              <>
                <InView
                  onChange={async (inView) => {
                    if (!inView) {
                      return;
                    }

                    const {
                      data: { wallet },
                    } = await offersQuery.fetchMore({
                      variables: {
                        ...offersQuery.variables,
                        offset: offersQuery.data?.wallet.offers.length,
                      },
                    });

                    setHasMore(wallet.offers.length > 0);
                  }}
                >
                  <Activity.Skeleton />
                </InView>
                <Activity.Skeleton />
                <Activity.Skeleton />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ProfileActivityLayoutProps {
  children: ReactElement;
  wallet: Wallet;
}

ProfileOffers.getLayout = function ProfileActivityLayout({
  children,
  wallet,
}: ProfileActivityLayoutProps): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};
