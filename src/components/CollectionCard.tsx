import clsx from 'clsx'
import { useTranslations } from 'next-intl'

import { Collection } from "../types"

interface CollectionCardProps {
  collection: Collection
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const t = useTranslations('CollectionCard')
  
  return (
    <article className="relative flex flex-col justify-end aspect-square w-full rounded-lg overflow-hidden shadow-lg transition hover:scale-[1.02]">
      <img src={collection.nft.image} className="absolute top-0 left-0 w-full h-full -z-10 object-cover" />
      <div className="absolute h-full w-full bg-gradient-to-b from-transparent to-gray-900/80 z-10 pointer-events-none" />
      <h1 className="z-20 px-4 text-3xl">
        {collection.nft.name}
      </h1>
      <footer className="w-full grid grid-cols-2 gap-2 z-20 text-white p-4">
      <div className="text-center bg-gray-800 backdrop-blur-md bg-opacity-50 p-2 rounded-lg text-sm xl:text-base">
          {t('count', { amount: collection.nftCount })}
        </div>
        <div className="text-center bg-gray-800 backdrop-blur-md bg-opacity-50 p-2 rounded-lg text-sm xl:text-base">
          {t('floor', { price: collection.floorPrice })}
        </div>
      </footer>
    </article>
  )
}

interface CollectionCardSkeletonProps {
  className?: string
}
CollectionCard.Skeleton = function CollectionCardSkeleton({ className }: CollectionCardSkeletonProps) {
  return (
    <div className={clsx('aspect-square bg-gray-800 rounded-lg', className)} />
  )
}