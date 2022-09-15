import { useLazyQuery } from '@apollo/client';
import React, { useState } from 'react';
import Modal from './Modal';
import OfferableQuery from './../queries/offerable.graphql';
import { Nft } from '../graphql.types';
import Button, { ButtonType } from './Button';
import { useTranslation } from 'next-i18next';
import { Form } from './Form';
import useMakeOffer from '../hooks/offer';
import Icon from './Icon';
import useLogin from '../hooks/login';

interface OfferableData {
  nft: Nft;
}

interface RenderProps {
  makeOffer: (mintAddress: string) => void;
  children: any;
}

interface OfferableProps {
  variant?: 'viewer' | 'buyer' | 'owner';
  children: (args: RenderProps) => any;
}

export function Offerable({ children, variant = 'viewer' }: OfferableProps) {
  const { t } = useTranslation('common');

  const [open, setOpen] = useState(false);
  const openOffer = (mintAddress: string) => {
    offerableQuery({ variables: { address: mintAddress } });
    setOpen(true);
  };

  const [offerableQuery, { data, loading, refetch, previousData }] =
    useLazyQuery<OfferableData>(OfferableQuery);

  const {
    makeOffer,
    registerOffer,
    onMakeOffer,
    handleSubmitOffer,
    onCancelOffer,
    offerFormState,
  } = useMakeOffer();

  const OfferableActions = () => {
    const onLogin = useLogin();

    switch (variant) {
      case 'viewer':
        return (
          <Button onClick={onLogin} className="font-semibold">
            {t('offerable.connectToOffer')}
          </Button>
        );
      case 'buyer':
        return (
          <>
            <section id={'offer-input'}>
              <Form.Label name={t('offerable.amount')}>
                <Form.Input
                  {...registerOffer('amount')}
                  autoFocus
                  className="input"
                  icon={<Icon.Solana height={20} width={24} gradient />}
                />
              </Form.Label>
            </section>
            <section id={'offer-buttons'} className="flex flex-col gap-4">
              <Button
                className="font-semibold"
                block
                htmlType="submit"
                loading={offerFormState.isSubmitting}
              >
                {t('offer')}
              </Button>
              <Button
                className="font-semibold"
                block
                onClick={() => {
                  onCancelOffer();
                  setOpen(false);
                }}
                type={ButtonType.Secondary}
              >
                {t('cancel')}
              </Button>
            </section>
          </>
        );
      case 'owner':
        setOpen(false);
        return null;
    }
  };

  return (
    <div>
      {children({
        makeOffer: openOffer,
        children,
      })}
      <Modal title={t('offerable.makeOffer')} open={open} setOpen={setOpen}>
        <div className="mt-6 flex flex-col gap-6">
          {loading ? (
            <>
              <section id={'loading-preview-card'} className="flex flex-row gap-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-800" />
                <div className="flex flex-col justify-between gap-2">
                  <p className="h-5 w-40 animate-pulse rounded-md bg-gray-800" />
                  <p className="h-4 w-32 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section id={'loading-prices'} className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section id={'loading-input'}>
                <div className="h-10 w-full animate-pulse rounded-md border-2 border-gray-800 bg-gray-900" />
              </section>
              <section id={'loading-buttons'} className="flex flex-col gap-4">
                <Button loading={true} />
                <Button loading={true} type={ButtonType.Secondary} />
              </section>
            </>
          ) : (
            <Form
              id="offerable-form"
              onSubmit={handleSubmitOffer(({ amount }) => {
                console.log(amount);
              })}
              className="flex flex-col gap-6"
            >
              <section id={'preview-card'} className="flex flex-row gap-4">
                <img
                  src={data?.nft.image}
                  alt={data?.nft.name}
                  className="h-12 w-12 rounded-md object-cover text-xs"
                />
                <div className="flex flex-col justify-between gap-2">
                  <p className="text-base font-medium text-white">{data?.nft.name}</p>
                  <p className="text-xs font-semibold text-gray-300">
                    {data?.nft.collection?.nft.name}
                  </p>
                </div>
              </section>
              <section id={'prices'} className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">{t('offerable.floorPrice')}</p>
                  <p className="text-base font-medium text-gray-300">
                    {data?.nft.collection?.floorPrice} SOL
                  </p>
                </div>
                {data?.nft.listings && data?.nft.listings.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.listPrice')}
                    </p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="text-base font-medium text-gray-300">
                      {data.nft.listings[0].previewPrice} SOL
                    </p>
                  </div>
                )}
                {data?.nft.purchases && data?.nft.purchases.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.lastSoldPrice')}
                    </p>
                    <p className="text-base font-medium text-gray-300">
                      {data.nft.purchases[0].previewPrice} SOL
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('offerable.minimumOfferAmount')}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {data?.nft.collection?.floorPrice} SOL
                  </p>
                </div>
                {/* TODO: replace dummy wallet balance with viewer data */}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('offerable.currentBalance')}
                  </p>
                  <p className="text-base font-medium text-gray-300">10 SOL</p>
                </div>
              </section>
              <OfferableActions />
            </Form>
          )}
        </div>
      </Modal>
      ;
    </div>
  );
}

interface OfferModalProps {
  loading: boolean;
  nftName: string;
  floorPrice: number;
  listedPrice: number;
  lastSoldPrice?: number;
  minimumOfferAmount: number;
}

function OfferModal({}: OfferModalProps) {
  return;
}
