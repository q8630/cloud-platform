import request from '@/utils/request'

export function fetchContractInfo(regionCode) {
  return request.post({
    url: '/v3/client/get-contract',
    data: { region_code: regionCode }
  })
}

export function signContract(contractId) {
  return request.post({
    url: '/v3/client/sign-contract',
    data: { contract_id: contractId }
  })
}
