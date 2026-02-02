import { StarIcon } from "@/icons"
import tailwindConfig from "../../../../tailwind.config"

export const StarRating = ({
  rate,
  starSize = 20,
  disabled,
  "data-testid": dataTestId,
}: {
  rate: number
  starSize?: number
  disabled?: boolean
  "data-testid"?: string
}) => {
  const getColorValue = (color: string | { DEFAULT: string; foreground: string } | undefined): string | undefined => {
    if (typeof color === 'object' && color !== null) {
      return color.DEFAULT
    }
    return color
  }

  return (
    <div className="flex" data-testid={dataTestId ?? 'star-rating'}>
      {[...Array(5)].map((_, i) => {
        const starColor =
          i < Math.floor(rate)
            ? disabled
              ? getColorValue(tailwindConfig.theme.extend.colors.disabled)
              : getColorValue(tailwindConfig.theme.extend.colors.primary)
            : getColorValue(tailwindConfig.theme.extend.colors.action.on.primary)
        return <StarIcon size={starSize} key={i} color={starColor} />
      })}
    </div>
  )
}
