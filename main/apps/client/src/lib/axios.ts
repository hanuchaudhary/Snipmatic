import { BACKEND_URL } from '@snipmatic/utils'
import axios from 'axios'

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export { api };