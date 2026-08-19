import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc, type DocumentData } from 'firebase/firestore'
import { CheckCircle2, FileText, Plus, RefreshCw, Search, Send, Trash2, Users, X } from 'lucide-react'
import { db } from '../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import '../agent-commissions-v4.css'

// [conteudo existente preservado]
