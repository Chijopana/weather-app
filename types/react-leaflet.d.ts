// types/react-leaflet.d.ts
import 'react-leaflet';
import { LatLngExpression, LatLngTuple } from 'leaflet';

declare module 'react-leaflet' {
  interface MapContainerProps {
    center?: LatLngExpression | LatLngTuple;
    zoom?: number;
    scrollWheelZoom?: boolean;
    className?: string;
    zoomControl?: boolean;
    children?: React.ReactNode;
  }

  interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  interface MarkerProps {
    position: LatLngExpression | LatLngTuple;
    children?: React.ReactNode;
  }

  interface PopupProps {
    className?: string;
    children?: React.ReactNode;
  }

  interface TooltipProps {
    direction?: 'right' | 'left' | 'top' | 'bottom' | 'center' | undefined;
    offset?: [number, number];
    opacity?: number;
    className?: string;
    children?: React.ReactNode;
  }
}
