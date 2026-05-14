// FIX for active trades - replace the useEffect that uses onTransactionsSnapshot

  useEffect(() => {
    const unsubscribe = onAllInvestmentsSnapshot((snapshot) => {
      const activeTrades = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'active';
      }).length;

      setStats(prev => ({
        ...prev,
        activeTrades,
      }));
    });

    return () => unsubscribe();
  }, []);
