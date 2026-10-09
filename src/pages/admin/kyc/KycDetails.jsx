import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export default function KycDetails() {
  const { merchantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/admin/merchants/${merchantId}?tab=kyc`, { replace: true });
  }, [merchantId, navigate]);

  return null;
}

